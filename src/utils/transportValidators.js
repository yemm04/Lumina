/**
 * Lumina Transporte - Validaciones y Motores de Cálculo
 * Funciones puras para DNI, Teléfono, Tarifas, Comisiones, Matching y Seguridad
 */

// Reglas de negocio documentadas (Documentación Técnica Maestra v3.0.0)
export const BUSINESS_RULES = {
  BASE_FARE: 5.0,
  PER_KM_STANDARD: 1.8,
  PER_KM_NIGHT: 2.1,
  PER_KM_COMFORT: 2.3,
  PER_MIN: 0.15,
  MIN_FARE: 6.0,
  ROUND_STEP: 0.5,
  COMMISSION_PCT: 15,
  MATCHING_TIMEOUT_SEC: 15,
  MATCHING_RADIUS_KM: 5,
  MATCHING_MAX_DRIVERS: 5,
  FREE_CANCEL_MIN: 3,
  CANCEL_FEE: 3.0,
  CASH_DEBT_LIMIT: 50.0,
  ACCEPTANCE_RATE_MIN: 80,
  REJECTION_PENALTY_PCT: 7
};

// Categorías de vehículo de la tabla vehicles: standard | mototaxi | comfort
export const RIDE_MODES = {
  estandar: { label: 'Estándar', desc: 'Tu viaje del día a día', category: 'standard', isNight: false },
  nocturno: { label: 'Nocturno seguro', desc: 'Monitoreo prioritario toda la ruta', category: 'standard', isNight: true },
  mototaxi: { label: 'Mototaxi', desc: 'Ágil en trayectos cortos', category: 'mototaxi', isNight: false },
  comfort: { label: 'Comfort', desc: 'Vehículo amplio, conductor élite', category: 'comfort', isNight: false },
  escolar: { label: 'Escolar', desc: 'Acompañamiento certificado', category: 'standard', isNight: false },
  adultos: { label: 'Adultos mayores', desc: 'Asistencia y paciencia adicional', category: 'standard', isNight: false }
};

export const RIDE_MODE_LIST = Object.entries(RIDE_MODES).map(([id, mode]) => ({ id, ...mode }));

export const getRideModeProfile = (modeId) => RIDE_MODES[modeId] || RIDE_MODES.nocturno;

export const validatePeruvianDNI = (dni) => {
  return /^\d{8}$/.test(dni?.trim?.() || '');
};

export const validatePeruvianPhone = (phone) => {
  let clean = (phone || '').replace(/\D/g, '');
  if (clean.startsWith('51') && clean.length === 11) {
    clean = clean.slice(2);
  }
  return clean.length === 9 && clean.startsWith('9');
};

// Formato de placa Áncash exigido por la tabla vehicles (ej. H2B-419)
export const validatePeruvianPlate = (plate) => {
  return /^[A-H][0-9A-H][A-Z]-[0-9]{3}$/.test((plate || '').trim().toUpperCase());
};

const roundFare = (value) => Math.ceil(value * 2) / 2;

/**
 * Tarifa fija (doc 5.1): Base + Precio por Km + Precio por Minuto,
 * con tarifa mínima en Chimbote y redondeo al alza a S/ 0.50 para facilitar el pago en efectivo.
 */
export const calculateFare = (distanceKm, durationMin, category = 'standard', isNight = false) => {
  const dist = Number(distanceKm) || 0;
  const min = Number(durationMin) || 0;

  // El documento solo distingue comfort del resto; mototaxi y estándar comparten la tarifa por km
  const perKm =
    category === 'comfort'
      ? BUSINESS_RULES.PER_KM_COMFORT
      : isNight
        ? BUSINESS_RULES.PER_KM_NIGHT
        : BUSINESS_RULES.PER_KM_STANDARD;

  let total =
    BUSINESS_RULES.BASE_FARE +
    dist * perKm +
    min * BUSINESS_RULES.PER_MIN;

  if (total < BUSINESS_RULES.MIN_FARE) total = BUSINESS_RULES.MIN_FARE;

  return roundFare(total);
};

export const calculateFareForMode = (distanceKm, durationMin, modeId) => {
  const { category, isNight } = getRideModeProfile(modeId);
  return calculateFare(distanceKm, durationMin, category, isNight);
};

// Desglose que ve el pasajero antes de confirmar, derivado de la misma fórmula
export const getFareBreakdown = (distanceKm, durationMin, category = 'standard', isNight = false) => {
  const base = BUSINESS_RULES.BASE_FARE;
  const perKm =
    category === 'comfort'
      ? BUSINESS_RULES.PER_KM_COMFORT
      : isNight
        ? BUSINESS_RULES.PER_KM_NIGHT
        : BUSINESS_RULES.PER_KM_STANDARD;

  const kmCharge = (Number(distanceKm) || 0) * perKm;
  const minCharge = (Number(durationMin) || 0) * BUSINESS_RULES.PER_MIN;
  const raw = base + kmCharge + minCharge;
  const appliedMinimum = raw < BUSINESS_RULES.MIN_FARE;

  return {
    base,
    perKm,
    kmCharge: Number(kmCharge.toFixed(2)),
    minCharge: Number(minCharge.toFixed(2)),
    appliedMinimum,
    total: calculateFare(distanceKm, durationMin, category, isNight)
  };
};

// La comisión trunca a céntimos (nunca redondea al alza) para no cobrar de más al conductor;
// el neto es el residuo, así comisión + neto siempre reconstruyen la tarifa exacta.
export const calculateCommission = (fare, commissionPct = BUSINESS_RULES.COMMISSION_PCT) => {
  const numericFare = Number(fare) || 0;
  return Number(Math.floor(numericFare * (commissionPct / 100) * 100 + 1e-9) / 100);
};

export const calculateDriverNet = (fare, commissionPct = BUSINESS_RULES.COMMISSION_PCT) => {
  const numericFare = Number(fare);
  if (isNaN(numericFare) || numericFare <= 0) return 0;
  return Number((numericFare - calculateCommission(numericFare, commissionPct)).toFixed(2));
};

/**
 * PIN de abordaje (doc 5.3): se genera en el "backend" del prototipo al solicitar el viaje.
 * Nunca es estático para que otro pasajero no pueda abordar con un código conocido.
 */
export const generateBoardingPin = () => String(Math.floor(1000 + Math.random() * 9000));

export const verifyBoardingPin = (expectedPin, enteredPin) => {
  const entered = String(enteredPin ?? '').trim();
  if (!/^\d{4}$/.test(entered)) return false;
  return entered === String(expectedPin ?? '').trim();
};

/**
 * KYC (doc 4.2 / 7.2): sólo el personal con verification_status = APPROVED entra al matching.
 * Sin el campo se asume aprobado para no romper datos ya validados.
 */
export const filterVerifiedDrivers = (drivers = []) =>
  drivers.filter((d) => (d.verificationStatus || 'APPROVED') === 'APPROVED');

/**
 * Matching (doc 5.2): radio de 5 km, orden por cercanía y máximos 5 candidatos.
 * Se excluyen conductores bajo la tasa de aceptación mínima (doc 8.2).
 */
export const findNearbyDrivers = (drivers = [], options = {}) => {
  const {
    radiusKm = BUSINESS_RULES.MATCHING_RADIUS_KM,
    limit = BUSINESS_RULES.MATCHING_MAX_DRIVERS,
    preferFemale = false,
    excludeIds = []
  } = options;

  return drivers
    .filter((d) => d.distanceKm <= radiusKm && !excludeIds.includes(d.id))
    .filter((d) => (d.acceptanceRate ?? 100) >= BUSINESS_RULES.ACCEPTANCE_RATE_MIN)
    .sort((a, b) => {
      if (preferFemale && a.isFemale !== b.isFemale) return a.isFemale ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, limit);
};

// Rotación del matching: si el job de BullMQ expira, se penaliza y se pasa al siguiente
export const penalizeDriverForRejection = (driver) => {
  if (!driver) return driver;
  return {
    ...driver,
    acceptanceRate: Number(Math.max(0, (driver.acceptanceRate ?? 100) - BUSINESS_RULES.REJECTION_PENALTY_PCT).toFixed(1))
  };
};

export const isDriverBlockedByRate = (driver) =>
  (driver?.acceptanceRate ?? 100) < BUSINESS_RULES.ACCEPTANCE_RATE_MIN;

// Cancelaciones (doc 8.2): gratis antes de 3 min, S/ 3.00 al conductor después
export const calculateCancellationFee = (minutesSinceAcceptance) => {
  const minutes = Number(minutesSinceAcceptance) || 0;
  return minutes < BUSINESS_RULES.FREE_CANCEL_MIN ? 0 : BUSINESS_RULES.CANCEL_FEE;
};

// Pago en efectivo (doc 8.1): la comisión se convierte en deuda de la billetera del conductor
export const applyCashCommissionDebt = (walletBalance, commission) => {
  const next = (Number(walletBalance) || 0) - (Number(commission) || 0);
  return Number(next.toFixed(2));
};

export const isWalletBlocked = (walletBalance) => Number(walletBalance) <= -BUSINESS_RULES.CASH_DEBT_LIMIT;

export const getWalletStatus = (walletBalance) => {
  const balance = Number(walletBalance) || 0;
  return {
    balance: Number(balance.toFixed(2)),
    debt: balance < 0 ? Number(Math.abs(balance).toFixed(2)) : 0,
    isBlocked: isWalletBlocked(balance)
  };
};

// Coordenadas interpoladas del viaje en curso, usadas por el reporte SOS (doc 8.3)
export const interpolateCoords = (origin, destination, progressPct) => {
  const t = Math.min(1, Math.max(0, (Number(progressPct) || 0) / 100));
  if (!Array.isArray(origin) || !Array.isArray(destination)) return origin || destination;
  return [
    Number((origin[0] + (destination[0] - origin[0]) * t).toFixed(4)),
    Number((origin[1] + (destination[1] - origin[1]) * t).toFixed(4))
  ];
};

export const formatSoles = (value) => `S/ ${(Number(value) || 0).toFixed(2)}`;

export const generateShareableTripMessage = ({ passenger, driver, trip }) => {
  return `Lumina Seguridad: ${passenger?.fullName || 'Pasajero'} está viajando en Chimbote hacia ${trip?.destination || 'Destino'} a bordo del ${driver?.vehicleModel || 'Vehículo'} (${driver?.vehicleColor || 'Color'}) placa ${driver?.plate || 'Placa'} con ${driver?.fullName || 'Conductor'}. Conductora calificada ${driver?.rating || 4.9}★.`;
};
