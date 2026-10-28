import { describe, it, expect } from 'vitest';
import {
  BUSINESS_RULES,
  validatePeruvianDNI,
  validatePeruvianPhone,
  validatePeruvianPlate,
  calculateFare,
  calculateFareForMode,
  getFareBreakdown,
  calculateDriverNet,
  calculateCommission,
  generateBoardingPin,
  verifyBoardingPin,
  findNearbyDrivers,
  filterVerifiedDrivers,
  penalizeDriverForRejection,
  isDriverBlockedByRate,
  calculateCancellationFee,
  applyCashCommissionDebt,
  isWalletBlocked,
  getWalletStatus,
  interpolateCoords,
  formatSoles,
  generateShareableTripMessage
} from '../utils/transportValidators';

const POOL = [
  { id: 'a', name: 'A', isFemale: false, acceptanceRate: 95, distanceKm: 4.2 },
  { id: 'b', name: 'B', isFemale: true, acceptanceRate: 90, distanceKm: 1.1 },
  { id: 'c', name: 'C', isFemale: true, acceptanceRate: 60, distanceKm: 0.5 },
  { id: 'd', name: 'D', isFemale: false, acceptanceRate: 88, distanceKm: 2.8 },
  { id: 'e', name: 'E', isFemale: true, acceptanceRate: 92, distanceKm: 6.5 },
  { id: 'f', name: 'F', isFemale: false, acceptanceRate: 85, distanceKm: 3.3 },
  { id: 'g', name: 'G', isFemale: true, acceptanceRate: 91, distanceKm: 2.0 }
];

describe('Lumina Transporte - Suite de Pruebas Unitarias e Integración', () => {
  describe('1. Validación de Datos Peruanos (DNI, Celular y Placa)', () => {
    it('debe validar un DNI peruano de 8 dígitos numéricos', () => {
      expect(validatePeruvianDNI('72418932')).toBe(true);
      expect(validatePeruvianDNI('01234567')).toBe(true);
      expect(validatePeruvianDNI('7241893')).toBe(false);
      expect(validatePeruvianDNI('724189321')).toBe(false);
      expect(validatePeruvianDNI('7241893A')).toBe(false);
    });

    it('debe validar teléfonos celulares peruanos (9 dígitos iniciando con 9)', () => {
      expect(validatePeruvianPhone('943512890')).toBe(true);
      expect(validatePeruvianPhone('943 512 890')).toBe(true);
      expect(validatePeruvianPhone('+51 943 512 890')).toBe(true);
      expect(validatePeruvianPhone('443512890')).toBe(false);
      expect(validatePeruvianPhone('94351289')).toBe(false);
    });

    it('debe validar el formato de placa de Áncash usado en vehicles', () => {
      expect(validatePeruvianPlate('H2B-419')).toBe(true);
      expect(validatePeruvianPlate('h2b-419')).toBe(true);
      expect(validatePeruvianPlate('BCF-524')).toBe(true);
      expect(validatePeruvianPlate('H2B419')).toBe(false);
      expect(validatePeruvianPlate('12B-419')).toBe(false);
      expect(validatePeruvianPlate('H2B-41')).toBe(false);
      expect(validatePeruvianPlate('')).toBe(false);
    });
  });

  describe('2. Motor Tarifario de Tarifa Fija (doc 5.1)', () => {
    it('aplica base S/ 5.00 + S/ 1.80 por km + S/ 0.15 por minuto', () => {
      // 5.00 + (5.6 * 1.80 = 10.08) + (14 * 0.15 = 2.10) = 17.18 -> 17.50
      expect(calculateFare(5.6, 14, 'standard', false)).toBe(17.5);
    });

    it('usa S/ 2.10 por km en modo nocturno y S/ 2.30 en comfort', () => {
      // Noche: 5.00 + 11.76 + 2.10 = 18.86 -> 19.00
      expect(calculateFare(5.6, 14, 'standard', true)).toBe(19.0);
      // Comfort: 5.00 + (5.6 * 2.30 = 12.88) + 2.10 = 19.98 -> 20.00
      expect(calculateFare(5.6, 14, 'comfort', false)).toBe(20.0);
    });

    it('nunca baja de la tarifa mínima de Chimbote (S/ 6.00)', () => {
      expect(calculateFare(0.2, 1, 'standard', false)).toBe(BUSINESS_RULES.MIN_FARE);
    });

    it('redondea siempre al múltiplo de S/ 0.50 para facilitar el efectivo', () => {
      const fares = [1.4, 3.2, 5.6, 8.2, 12.7].map((km) => calculateFare(km, 9, 'standard', true));
      fares.forEach((fare) => {
        expect(Number.isInteger(fare * 2)).toBe(true);
      });
    });

    it('el modo de la app define la categoría y la tarifa nocturna', () => {
      expect(calculateFareForMode(5.6, 14, 'nocturno')).toBe(calculateFare(5.6, 14, 'standard', true));
      expect(calculateFareForMode(5.6, 14, 'estandar')).toBe(calculateFare(5.6, 14, 'standard', false));
      expect(calculateFareForMode(5.6, 14, 'comfort')).toBe(calculateFare(5.6, 14, 'comfort', false));
    });

    it('expone el desglose que ve el pasajero antes de confirmar', () => {
      const breakdown = getFareBreakdown(5.6, 14, 'standard', true);
      expect(breakdown.base).toBe(5.0);
      expect(breakdown.perKm).toBe(2.1);
      expect(breakdown.kmCharge).toBe(11.76);
      expect(breakdown.minCharge).toBe(2.1);
      expect(breakdown.appliedMinimum).toBe(false);
      expect(breakdown.total).toBe(19.0);
    });

    it('descuenta exactamente el 15% de comisión para la ganancia del conductor', () => {
      expect(calculateDriverNet(14.5, 15)).toBe(12.33);
      expect(calculateDriverNet(10.0, 15)).toBe(8.5);
      expect(calculateDriverNet(20.0, 15)).toBe(17.0);
      expect(calculateCommission(14.5)).toBe(2.17);
      expect(calculateCommission(17.5)).toBe(2.62);
      expect(calculateDriverNet(17.5)).toBe(14.88);
      expect(calculateDriverNet(0)).toBe(0);
    });

    it('comisión + neto reconstruyen la tarifa fija al céntimo exacto', () => {
      [6, 8.5, 11, 17.5, 19, 20, 23, 25].forEach((fare) => {
        expect(Number((calculateDriverNet(fare) + calculateCommission(fare)).toFixed(2))).toBe(fare);
      });
    });
  });

  describe('3. PIN de Abordaje Dinámico (doc 5.3)', () => {
    it('genera un PIN aleatorio de 4 dígitos sin ceros a la izquierda', () => {
      const pins = Array.from({ length: 200 }, () => generateBoardingPin());
      pins.forEach((pin) => {
        expect(pin).toMatch(/^[1-9]\d{3}$/);
      });
      expect(new Set(pins).size).toBeGreaterThan(1);
    });

    it('sólo autoriza el viaje con el PIN exacto del pasajero', () => {
      expect(verifyBoardingPin('4827', '4827')).toBe(true);
      expect(verifyBoardingPin('4827', ' 4827 ')).toBe(true);
      expect(verifyBoardingPin('4827', '0000')).toBe(false);
      expect(verifyBoardingPin('4827', '')).toBe(false);
      expect(verifyBoardingPin('4827', null)).toBe(false);
    });

    it('rechaza PINs incompletos aunque coincidan en prefijo', () => {
      expect(verifyBoardingPin('4827', '482')).toBe(false);
      expect(verifyBoardingPin('4827', '48277')).toBe(false);
    });
  });

  describe('4. Matching por Cercanía (doc 5.2)', () => {
    it('filtra por radio de 5 km y ordena por distancia', () => {
      const result = findNearbyDrivers(POOL, { preferFemale: false });
      expect(result.map((d) => d.id)).toEqual(['b', 'g', 'd', 'f', 'a']);
    });

    it('excluye conductoras bajo la tasa de aceptación mínima', () => {
      const result = findNearbyDrivers(POOL);
      expect(result.some((d) => d.id === 'c')).toBe(false);
    });

    it('prioriza conductoras cuando el pasajero lo solicita', () => {
      const result = findNearbyDrivers(POOL, { preferFemale: true });
      expect(result[0].isFemale).toBe(true);
      expect(result[1].isFemale).toBe(true);
    });

    it('excluye del matching a quien no tenga KYC aprobado (doc 4.2)', () => {
      const conKyc = [
        { id: 'ok', name: 'OK', acceptanceRate: 90, distanceKm: 1, verificationStatus: 'APPROVED' },
        { id: 'pend', name: 'P', acceptanceRate: 90, distanceKm: 1.2, verificationStatus: 'PENDING' },
        { id: 'rej', name: 'R', acceptanceRate: 90, distanceKm: 1.4, verificationStatus: 'REJECTED' }
      ];
      expect(filterVerifiedDrivers(conKyc).map((d) => d.id)).toEqual(['ok']);
      expect(findNearbyDrivers(filterVerifiedDrivers(conKyc)).map((d) => d.id)).toEqual(['ok']);
      // las conductoras sin el campo se consideran verificadas
      expect(filterVerifiedDrivers(POOL)).toHaveLength(POOL.length);
    });

    it('devuelve máximo 5 candidatos', () => {
      const many = Array.from({ length: 9 }, (_, i) => ({
        id: `d${i}`,
        name: `D${i}`,
        isFemale: false,
        acceptanceRate: 99,
        distanceKm: 0.5 + i * 0.4
      }));
      expect(findNearbyDrivers(many)).toHaveLength(BUSINESS_RULES.MATCHING_MAX_DRIVERS);
    });

    it('penaliza la tasa de aceptación al rechazar y bloquea bajo el umbral', () => {
      const penalized = penalizeDriverForRejection({ id: 'x', acceptanceRate: 85 });
      expect(penalized.acceptanceRate).toBe(78);
      expect(isDriverBlockedByRate(penalized)).toBe(true);
      expect(isDriverBlockedByRate({ acceptanceRate: BUSINESS_RULES.ACCEPTANCE_RATE_MIN })).toBe(false);
    });
  });

  describe('5. Pago en Efectivo, Billetera y Deuda (doc 8.1)', () => {
    it('resta la comisión de cobros en efectivo a la billetera', () => {
      expect(applyCashCommissionDebt(0, 2.17)).toBe(-2.17);
      expect(applyCashCommissionDebt(-10, 2.6)).toBe(-12.6);
    });

    it('bloquea al conductor al llegar a -S/ 50.00', () => {
      expect(isWalletBlocked(-49.5)).toBe(false);
      expect(isWalletBlocked(-50)).toBe(true);
      expect(isWalletBlocked(-52.3)).toBe(true);
      const status = getWalletStatus(-50);
      expect(status.isBlocked).toBe(true);
      expect(status.debt).toBe(50);
    });

    it('no marca deuda cuando el saldo es positivo', () => {
      const status = getWalletStatus(35.5);
      expect(status.debt).toBe(0);
      expect(status.isBlocked).toBe(false);
      expect(status.balance).toBe(35.5);
    });
  });

  describe('6. Cancelaciones y Penalizaciones (doc 8.2)', () => {
    it('es gratis cancelar antes de los 3 minutos', () => {
      expect(calculateCancellationFee(0)).toBe(0);
      expect(calculateCancellationFee(2.99)).toBe(0);
    });

    it('cobra S/ 3.00 al conductor pasados los 3 minutos', () => {
      expect(calculateCancellationFee(3)).toBe(BUSINESS_RULES.CANCEL_FEE);
      expect(calculateCancellationFee(12)).toBe(BUSINESS_RULES.CANCEL_FEE);
    });
  });

  describe('7. Geolocalización del Viaje y Reporte SOS (doc 8.3)', () => {
    it('interpola la posición del vehículo entre origen y destino', () => {
      expect(interpolateCoords([-9.1245, -78.5306], [-9.088, -78.572], 0)).toEqual([-9.1245, -78.5306]);
      expect(interpolateCoords([-9.1245, -78.5306], [-9.088, -78.572], 100)).toEqual([-9.088, -78.572]);
      expect(interpolateCoords([-9.1245, -78.5306], [-9.088, -78.572], 50)).toEqual([-9.1062, -78.5513]);
    });

    it('limita el progreso fuera de rango 0-100', () => {
      expect(interpolateCoords([-9.0, -78.6], [-9.1, -78.5], 250)).toEqual([-9.1, -78.5]);
      expect(interpolateCoords([-9.0, -78.6], [-9.1, -78.5], -10)).toEqual([-9, -78.6]);
    });
  });

  describe('8. Mensaje de Seguimiento Seguro (WhatsApp / Contacto de Emergencia)', () => {
    it('debe contener la placa del vehículo, el nombre del conductor y el destino de Chimbote', () => {
      const msg = generateShareableTripMessage({
        passenger: { fullName: 'Carlos Mendoza' },
        driver: { fullName: 'Camila Torres', vehicleModel: 'Kia Niro', vehicleColor: 'azul noche', plate: 'H2B-419', rating: 4.96 },
        trip: { destination: 'Megaplaza Chimbote' }
      });

      expect(msg).toContain('H2B-419');
      expect(msg).toContain('Megaplaza Chimbote');
      expect(msg).toContain('Camila Torres');
      expect(msg).toContain('Kia Niro');
    });

    it('formatea importes en soles con dos decimales', () => {
      expect(formatSoles(14.5)).toBe('S/ 14.50');
      expect(formatSoles(-50)).toBe('S/ -50.00');
      expect(formatSoles(undefined)).toBe('S/ 0.00');
    });
  });
});
