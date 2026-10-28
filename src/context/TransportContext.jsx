import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { sound } from '../utils/audioEffects';
import {
  BUSINESS_RULES,
  getRideModeProfile,
  calculateFare,
  calculateCommission,
  calculateDriverNet,
  generateBoardingPin,
  verifyBoardingPin,
  findNearbyDrivers,
  filterVerifiedDrivers,
  penalizeDriverForRejection,
  isDriverBlockedByRate,
  calculateCancellationFee,
  applyCashCommissionDebt,
  getWalletStatus,
  formatSoles,
  interpolateCoords
} from '../utils/transportValidators';

const TransportContext = createContext(null);

export const TRIP_STATUS = {
  IDLE: 'IDLE',
  REQUESTING: 'REQUESTING', // Pasajero buscando / esperando aceptación
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED', // Conductor aceptó, va al punto de recogida
  DRIVER_ARRIVED: 'DRIVER_ARRIVED', // Conductor llegó al lobby
  IN_PROGRESS: 'IN_PROGRESS', // PIN verificado, viaje en camino
  COMPLETED: 'COMPLETED', // Llegó al destino
  CANCELLED: 'CANCELLED', // Anulado por pasajero o conductora
  NO_DRIVER: 'NO_DRIVER' // Los candidatos expiraron sin aceptar
};

// Puntos de alta frecuencia y mejores calificaciones en Google Maps en Chimbote y Nuevo Chimbote
export const CHIMBOTE_POPULAR_PLACES = [
  {
    id: 'megaplaza',
    name: 'Megaplaza Chimbote',
    address: 'Av. Panamericana Norte Km 424, Chimbote',
    coords: [-9.0880, -78.5720],
    rating: 4.4,
    reviewsCount: '12,540',
    category: 'Centro Comercial y Cines',
    distanceKm: 5.6,
    durationMin: 14
  },
  {
    id: 'plaza_nch',
    name: 'Plaza Mayor de Nuevo Chimbote',
    address: 'Av. Pacífico s/n, Nuevo Chimbote',
    coords: [-9.1245, -78.5306],
    rating: 4.6,
    reviewsCount: '4,850',
    category: 'Catedral y Centro Cívico',
    distanceKm: 1.2,
    durationMin: 4
  },
  {
    id: 'uns',
    name: 'Universidad Nacional del Santa (UNS)',
    address: 'Av. Universitaria s/n, Urb. Bellamar, Nuevo Chimbote',
    coords: [-9.1205, -78.5260],
    rating: 4.5,
    reviewsCount: '1,920',
    category: 'Educación Superior',
    distanceKm: 1.8,
    durationMin: 6
  },
  {
    id: 'plaza_chimbote',
    name: 'Plaza de Armas de Chimbote',
    address: 'Av. José Pardo / Jr. Enrique Palacios, Chimbote Centro',
    coords: [-9.0745, -78.5936],
    rating: 4.3,
    reviewsCount: '6,210',
    category: 'Centro Histórico y Bancos',
    distanceKm: 8.2,
    durationMin: 18
  },
  {
    id: 'vivero',
    name: 'Vivero Forestal de Chimbote',
    address: 'Av. Industrial s/n (Panamericana Norte), Chimbote',
    coords: [-9.0600, -78.5750],
    rating: 4.4,
    reviewsCount: '5,580',
    category: 'Parque y Recreación',
    distanceKm: 7.0,
    durationMin: 16
  },
  {
    id: 'malecon',
    name: 'Malecón Grau y Bahía El Ferrol',
    address: 'Malecón Grau / Jr. Tumbes, Chimbote',
    coords: [-9.0760, -78.6010],
    rating: 4.2,
    reviewsCount: '3,120',
    category: 'Paseo Marítimo',
    distanceKm: 9.1,
    durationMin: 20
  },
  {
    id: 'hospital',
    name: 'Hospital Regional Eleazar Guzmán Barrón',
    address: 'Av. Brasil s/n, Nuevo Chimbote',
    coords: [-9.1170, -78.5370],
    rating: 3.9,
    reviewsCount: '1,240',
    category: 'Salud y Emergencias',
    distanceKm: 2.4,
    durationMin: 7
  }
];

// Pool simulado de conductores online dentro del radio de 5 km (doc 5.2, GEOADD drivers:online)
// verificationStatus / licenseNumber / soatExpiration replican la tabla drivers (doc 4.2)
const INITIAL_DRIVER_POOL = [
  {
    id: 'camila',
    name: 'Camila Torres',
    initials: 'CT',
    isFemale: true,
    rating: 4.96,
    tripsCount: 1842,
    acceptanceRate: 97,
    vehicleModel: 'Kia Niro',
    vehicleColor: 'azul noche',
    plate: 'H2B-419',
    category: 'standard',
    distanceKm: 0.6,
    etaMin: 3,
    coords: [-9.1198, -78.5288],
    verificationStatus: 'APPROVED',
    licenseNumber: 'DL-0421789',
    soatExpiration: '2026-11-30',
    walletBalance: 0
  },
  {
    id: 'rosario',
    name: 'Rosario Meza',
    initials: 'RM',
    isFemale: true,
    rating: 4.88,
    tripsCount: 1210,
    acceptanceRate: 93,
    vehicleModel: 'Toyota Corolla',
    vehicleColor: 'plata',
    plate: 'H3F-820',
    category: 'comfort',
    distanceKm: 1.4,
    etaMin: 5,
    coords: [-9.1102, -78.5361],
    verificationStatus: 'APPROVED',
    licenseNumber: 'DL-0398421',
    soatExpiration: '2026-12-15',
    walletBalance: -12.4
  },
  {
    id: 'jorge',
    name: 'Jorge Salinas',
    initials: 'JS',
    isFemale: false,
    rating: 4.79,
    tripsCount: 980,
    acceptanceRate: 88,
    vehicleModel: 'Hyundai Accent',
    vehicleColor: 'blanco',
    plate: 'H1C-305',
    category: 'standard',
    distanceKm: 2.1,
    etaMin: 7,
    coords: [-9.0955, -78.5590],
    verificationStatus: 'APPROVED',
    licenseNumber: 'DL-0512330',
    soatExpiration: '2027-01-20',
    walletBalance: -31.65
  },
  {
    id: 'miluska',
    name: 'Miluska Prado',
    initials: 'MP',
    isFemale: true,
    rating: 4.91,
    tripsCount: 1533,
    acceptanceRate: 95,
    vehicleModel: 'Chery Tiggo',
    vehicleColor: 'gris grafito',
    plate: 'H4D-118',
    category: 'comfort',
    distanceKm: 3.5,
    etaMin: 9,
    coords: [-9.0812, -78.5744],
    verificationStatus: 'APPROVED',
    licenseNumber: 'DL-0487112',
    soatExpiration: '2026-10-05',
    walletBalance: 0
  },
  {
    id: 'anderson',
    name: 'Anderson Vega',
    initials: 'AV',
    isFemale: false,
    rating: 4.62,
    tripsCount: 604,
    acceptanceRate: 84,
    vehicleModel: 'Yamaha Exciter (mototaxi)',
    vehicleColor: 'rojo',
    plate: 'H7L-902',
    category: 'mototaxi',
    distanceKm: 4.8,
    etaMin: 11,
    coords: [-9.0680, -78.5873],
    verificationStatus: 'APPROVED',
    licenseNumber: 'DL-0620881',
    soatExpiration: '2026-09-28',
    walletBalance: -47.2
  },
  {
    id: 'fiorella',
    name: 'Fiorella Réano',
    initials: 'FR',
    isFemale: true,
    rating: 4.7,
    tripsCount: 128,
    acceptanceRate: 90,
    vehicleModel: 'Toyota Yaris',
    vehicleColor: 'negro',
    plate: 'H5M-771',
    category: 'standard',
    distanceKm: 1.9,
    etaMin: 6,
    coords: [-9.1264, -78.5192],
    verificationStatus: 'PENDING',
    licenseNumber: 'DL-0733019',
    soatExpiration: '2027-03-11',
    walletBalance: 0
  },
  {
    id: 'oscar',
    name: 'Óscar Villanueva',
    initials: 'OV',
    isFemale: false,
    rating: 4.4,
    tripsCount: 61,
    acceptanceRate: 76,
    vehicleModel: 'Bajón 150 (mototaxi)',
    vehicleColor: 'amarillo',
    plate: 'H8T-240',
    category: 'mototaxi',
    distanceKm: 2.6,
    etaMin: 8,
    coords: [-9.0918, -78.5982],
    verificationStatus: 'PENDING',
    licenseNumber: 'DL-0741205',
    soatExpiration: '2026-08-19',
    walletBalance: 0
  }
];

const WALLET_STORAGE_KEY = 'lumina_driver_wallet';

export const TransportProvider = ({ children }) => {
  // Configuración general
  const [viewMode, setViewMode] = useState('dual'); // 'dual' | 'passenger' | 'driver' | 'admin'
  const [userGenderMode, setUserGenderMode] = useState('universal'); // 'universal' | 'women_priority'

  // Perfil del Usuario Pasajero con persistencia en localStorage
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      fullName: 'Carlos Mendoza Ramos',
      dni: '72418932',
      phone: '943 512 890',
      emergencyContactName: 'Mamá (Elena Ramos)',
      emergencyContactPhone: '943 881 204'
    };
  });

  const saveUserProfile = (newProfile) => {
    sound.tap();
    const updated = { ...userProfile, ...newProfile };
    setUserProfile(updated);
    try {
      localStorage.setItem('lumina_user_profile', JSON.stringify(updated));
    } catch (e) {}
  };

  // Pasajero: Estado de pantalla actual
  const [passengerStep, setPassengerStep] = useState(1);
  const [biometricsDone, setBiometricsDone] = useState(false);
  const [preferFemaleDriver, setPreferFemaleDriver] = useState(true);
  const [selectedRideCategory, setSelectedRideCategory] = useState('nocturno');
  const [paymentMethod, setPaymentMethod] = useState('card'); // card | yape | cash

  // Datos del viaje: 100% enfocado en Chimbote y Nuevo Chimbote
  const [tripData, setTripData] = useState({
    origin: 'Plaza Mayor de Nuevo Chimbote, Av. Pacífico',
    originCoords: [-9.1245, -78.5306],
    destination: 'Megaplaza Chimbote, Av. Panamericana Norte',
    destinationCoords: [-9.0880, -78.5720],
    time: 'Hoy · 11:00 p.m.',
    passengers: 1,
    distanceKm: 5.6,
    durationMin: 14,
    fixedFare: 0,
    driverFareNet: 0,
    commissionFee: 0,
    commissionPct: BUSINESS_RULES.COMMISSION_PCT,
    pin: '',
    plate: '',
    vehicle: '',
    driverName: '',
    driverRating: 0
  });

  // Estado del ciclo de vida del viaje
  const [tripStatus, setTripStatus] = useState(TRIP_STATUS.IDLE);

  // Matching: cola de candidatos y rotación por expiración del job de 15 s
  const [driverPool, setDriverPool] = useState(INITIAL_DRIVER_POOL);
  const [matchQueue, setMatchQueue] = useState([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [requestTimer, setRequestTimer] = useState(BUSINESS_RULES.MATCHING_TIMEOUT_SEC);
  const [matchingLog, setMatchingLog] = useState([]);

  // Bitácora del contrato v2 (doc 6.1 endpoints REST y 6.2 eventos Socket.io), simulado en el navegador
  const [apiLog, setApiLog] = useState([]);

  const [activeDriver, setActiveDriver] = useState(INITIAL_DRIVER_POOL[0]);
  const [acceptedAt, setAcceptedAt] = useState(null);
  const [waitedSeconds, setWaitedSeconds] = useState(0);
  const [lastCancellation, setLastCancellation] = useState(null);

  // Billetera del conductor: control de deuda por viajes en efectivo (doc 8.1)
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      const saved = localStorage.getItem(WALLET_STORAGE_KEY);
      if (saved) return Number(saved);
    } catch (e) {}
    return 0;
  });
  const [debtModalOpen, setDebtModalOpen] = useState(false);

  // Historial de la sesión para la pantalla de ganancias
  const [tripHistory, setTripHistory] = useState([
    { id: 't-prev-1', label: 'UNS ➔ Plaza Nuevo Chimbote', time: '10:15 p.m.', net: 7.22, method: 'card' }
  ]);

  // Notificación flotante de llegada
  const [arrivalNotification, setArrivalNotification] = useState(false);

  // Conductor: Estado de pantalla actual
  const [driverStep, setDriverStep] = useState(2);
  const [driverIsActive, setDriverIsActive] = useState(true);
  const [driverEarningsToday, setDriverEarningsToday] = useState(72.5);
  const [driverCompletedTripsCount, setDriverCompletedTripsCount] = useState(4);

  // Animación del viaje (progreso 0% a 100%)
  const [tripProgress, setTripProgress] = useState(0);

  // Alerta SOS
  const [sosActive, setSosActive] = useState(false);
  const [sosTriggeredBy, setSosTriggeredBy] = useState(null);
  const [sosEvents, setSosEvents] = useState([]);

  // Chat rápido simulado
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: '¡Buenas noches! Estoy en camino por la Av. Pacífico en el Kia Niro azul.', time: '11:02 p.m.' }
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Modal interactivo de Google Maps (Chimbote y Nuevo Chimbote)
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const rideProfile = getRideModeProfile(selectedRideCategory);

  // Tarifa fija siempre recalculada con la fórmula del documento (5.1)
  const quotedFare = useMemo(
    () => calculateFare(tripData.distanceKm, tripData.durationMin, rideProfile.category, rideProfile.isNight),
    [tripData.distanceKm, tripData.durationMin, rideProfile.category, rideProfile.isNight]
  );

  useEffect(() => {
    setTripData((prev) => {
      if (prev.fixedFare === quotedFare) return prev;
      return {
        ...prev,
        fixedFare: quotedFare,
        commissionFee: calculateCommission(quotedFare),
        driverFareNet: calculateDriverNet(quotedFare)
      };
    });
  }, [quotedFare]);

  // Cronómetro de espera desde la aceptación, usado por la regla de cancelación (doc 8.2)
  useEffect(() => {
    let interval;
    if (acceptedAt && (tripStatus === TRIP_STATUS.DRIVER_ACCEPTED || tripStatus === TRIP_STATUS.DRIVER_ARRIVED)) {
      interval = setInterval(() => {
        setWaitedSeconds(Math.floor((Date.now() - acceptedAt) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [acceptedAt, tripStatus]);

  // Cuenta regresiva de 15 s por candidato (job de BullMQ)
  useEffect(() => {
    let timer;
    if (tripStatus === TRIP_STATUS.REQUESTING) {
      setRequestTimer(BUSINESS_RULES.MATCHING_TIMEOUT_SEC);
      timer = setInterval(() => {
        setRequestTimer((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tripStatus, candidateIndex]);

  // Simulación de avance en tiempo real cuando el viaje está en curso
  useEffect(() => {
    let interval;
    if (tripStatus === TRIP_STATUS.IN_PROGRESS) {
      interval = setInterval(() => {
        // ~20 segundos para un viaje visible y fluido
        setTripProgress((prev) => Math.min(prev + 1.25, 100));
      }, 250);
    }
    return () => clearInterval(interval);
  }, [tripStatus]);

  // finishTrip fuera del updater: StrictMode invoca dos veces el reducer y duplicaría el PATCH
  useEffect(() => {
    if (tripStatus === TRIP_STATUS.IN_PROGRESS && tripProgress >= 100) finishTrip();
  }, [tripProgress, tripStatus]);

  const walletStatus = getWalletStatus(walletBalance);

  const currentCandidate = matchQueue[candidateIndex]
    ? driverPool.find((d) => d.id === matchQueue[candidateIndex])
    : null;

  const logMatching = (text) => setMatchingLog((prev) => [text, ...prev].slice(0, 6));

  const emitApi = (kind, name, detail = '') =>
    setApiLog((prev) =>
      [
        {
          id: `${kind}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          kind,
          name,
          detail,
          at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev
      ].slice(0, 40)
    );

  // Snapshot en ref para emitir telemetría cada 3 s sin reiniciar el intervalo (doc 6.2)
  const tripSnapshotRef = useRef({ progress: 0, origin: null, dest: null });
  const finishedTripRef = useRef(false);
  useEffect(() => {
    tripSnapshotRef.current = {
      progress: tripProgress,
      origin: tripData.originCoords,
      dest: tripData.destinationCoords
    };
  }, [tripProgress, tripData.originCoords, tripData.destinationCoords]);

  // El montaje en StrictMode repite el efecto: el ref deja la sesión JWT como un único evento
  const loginEmittedRef = useRef(false);
  useEffect(() => {
    if (loginEmittedRef.current) return;
    loginEmittedRef.current = true;
    emitApi('REST', 'POST /api/auth/login', '200 JWT • roles passenger + driver (doc 6.1)');
  }, []);

  useEffect(() => {
    if (tripStatus !== TRIP_STATUS.IDLE) {
      emitApi('WS', 'trip_status_changed', tripStatus);
    }
  }, [tripStatus]);

  useEffect(() => {
    if (tripStatus !== TRIP_STATUS.IN_PROGRESS) return undefined;
    const interval = setInterval(() => {
      const { progress, origin, dest } = tripSnapshotRef.current;
      const coords = interpolateCoords(origin, dest, progress);
      emitApi('REST', 'POST /api/drivers/location', `${coords[0]}, ${coords[1]} • progreso ${Math.round(progress)}%`);
      emitApi('WS', 'driver_location_update', 'room trip_actual → el mapa del pasajero mueve el auto');
    }, 3000);
    return () => clearInterval(interval);
  }, [tripStatus]);

  // Selección de destino con tarifa calculada por el motor tarifario
  const selectDestination = (destOption) => {
    sound.tap();
    setTripData((prev) => ({
      ...prev,
      destination: destOption.address || destOption.name,
      destinationCoords: destOption.coords || prev.destinationCoords,
      distanceKm: destOption.distanceKm ?? destOption.distance ?? prev.distanceKm,
      durationMin: destOption.durationMin ?? destOption.duration ?? prev.durationMin
    }));
  };

  const buildMatchQueue = () =>
    findNearbyDrivers(filterVerifiedDrivers(driverPool), { preferFemale: preferFemaleDriver }).map((d) => d.id);

  const requestTrip = () => {
    sound.tap();
    finishedTripRef.current = false;
    const queue = buildMatchQueue();
    emitApi(
      'REST',
      'POST /api/trips/estimate',
      `${tripData.distanceKm} km • ${tripData.durationMin} min • ${rideProfile.label} → ${formatSoles(quotedFare)}`
    );
    setMatchQueue(queue);
    setCandidateIndex(0);
    setLastCancellation(null);
    setTripData((prev) => ({ ...prev, pin: generateBoardingPin() })); // PIN aleatorio, doc 5.3
    setAcceptedAt(null);
    setWaitedSeconds(0);
    setArrivalNotification(false);
    setTripStatus(TRIP_STATUS.REQUESTING);
    setPassengerStep(5);
    emitApi('REST', 'POST /api/trips/request', `status=REQUESTING • ${queue.length} candidatas en radio de 5 km`);

    if (queue.length === 0) {
      setTripStatus(TRIP_STATUS.NO_DRIVER);
      return;
    }

    logMatching(`Buscando entre ${queue.length} conductoras/es en radio de 5 km`);
    setTimeout(() => sound.requestChime(), 400);
  };

  // El conductor no responde en 15 s: se penaliza y se pasa al siguiente candidato
  const advanceMatching = (reason) => {
    const timedOut = currentCandidate;
    if (timedOut) {
      setDriverPool((prev) =>
        prev.map((d) => (d.id === timedOut.id ? penalizeDriverForRejection(d) : d))
      );
      emitApi('WS', 'matching_candidate_expired', `${timedOut.name} ${reason}`);
      logMatching(
        `${timedOut.name} ${reason} • tasa de aceptación ${Math.max(0, timedOut.acceptanceRate - BUSINESS_RULES.REJECTION_PENALTY_PCT)}%`
      );
    }

    const nextIndex = candidateIndex + 1;
    if (nextIndex < matchQueue.length) {
      setCandidateIndex(nextIndex);
      setDriverStep(3);
      sound.requestChime();
    } else {
      setTripStatus(TRIP_STATUS.NO_DRIVER);
      sound.tap();
    }
  };

  useEffect(() => {
    if (tripStatus === TRIP_STATUS.REQUESTING && requestTimer === 0) {
      advanceMatching('no respondió en 15 s');
    }
  }, [requestTimer, tripStatus]);

  const acceptTripByDriver = (driverId) => {
    const driver = driverPool.find((d) => d.id === (driverId || currentCandidate?.id)) || activeDriver;
    sound.success();
    setActiveDriver(driver);
    setAcceptedAt(Date.now());
    setWaitedSeconds(0);
    setTripStatus(TRIP_STATUS.DRIVER_ACCEPTED);
    setTripData((prev) => ({
      ...prev,
      plate: driver.plate,
      vehicle: `${driver.vehicleModel} ${driver.vehicleColor}`,
      driverName: driver.name,
      driverRating: driver.rating
    }));
    logMatching(`${driver.name} aceptó el viaje`);
    emitApi('REST', 'PATCH /api/trips/:id/accept', `${driver.name} (${driver.plate}) • status=ACCEPTED`);
    setPassengerStep(6);
    setDriverStep(4);
  };

  const rejectTripByDriver = () => {
    sound.tap();
    advanceMatching('rechazó la solicitud');
  };

  // Cancelación del pasajero con tarifa de penalización si ya pasaron 3 min (doc 8.2)
  const cancelTripByPassenger = (minutesOverride, options = {}) => {
    const minutes =
      minutesOverride ?? Math.max(0, (Date.now() - (acceptedAt || Date.now())) / 60000);
    const wasAccepted =
      options.wasAccepted || [TRIP_STATUS.DRIVER_ACCEPTED, TRIP_STATUS.DRIVER_ARRIVED].includes(tripStatus);
    const fee = wasAccepted ? calculateCancellationFee(minutes) : 0;

    sound.tap();

    if (fee > 0) {
      setDriverEarningsToday((prev) => Number((prev + fee).toFixed(2)));
    }

    setLastCancellation({
      fee,
      minutes: Number(minutes.toFixed(1)),
      reason: !wasAccepted && tripStatus === TRIP_STATUS.REQUESTING ? 'no_drivers' : 'passenger'
    });
    setTripStatus(TRIP_STATUS.CANCELLED);
    setArrivalNotification(false);
    setPassengerStep(5);
    setDriverStep(2);
    emitApi(
      'REST',
      'PATCH /api/trips/:id/cancel',
      fee > 0 ? `200 cargo S/ 3.00 a la conductora (${minutes.toFixed(1)} min)` : '200 cancelación sin cargo (< 3 min)'
    );
  };

  const notifyDriverArrived = () => {
    sound.success();
    setTripStatus(TRIP_STATUS.DRIVER_ARRIVED);
  };

  // El viaje sólo inicia si el PIN escrito por la conductora coincide con el del pasajero
  const startTripWithPin = (enteredPin) => {
    if (!verifyBoardingPin(tripData.pin, enteredPin)) {
      sound.tap();
      emitApi('REST', 'POST /api/trips/:id/verify-pin', '401 PIN incorrecto • el viaje sigue bloqueado');
      return false;
    }
    sound.success();
    emitApi('REST', 'POST /api/trips/:id/verify-pin', `200 PIN verificado • status=IN_PROGRESS`);
    setTripStatus(TRIP_STATUS.IN_PROGRESS);
    setTripProgress(0);
    setPassengerStep(7);
    setDriverStep(5);
    return true;
  };

  const finishTrip = () => {
    if (finishedTripRef.current) return;
    finishedTripRef.current = true;
    sound.success();
    const commission = calculateCommission(tripData.fixedFare);
    const net = calculateDriverNet(tripData.fixedFare);

    setTripStatus(TRIP_STATUS.COMPLETED);
    setArrivalNotification(true);
    setPassengerStep(8);
    setDriverStep(6);
    setDriverEarningsToday((prev) => Number((prev + net).toFixed(2)));
    setDriverCompletedTripsCount((prev) => prev + 1);
    emitApi(
      'REST',
      'PATCH /api/trips/:id/finish',
      `tarifa ${formatSoles(tripData.fixedFare)} • comisión ${formatSoles(commission)} • neto ${formatSoles(net)} • ${paymentMethod}`
    );
    setTripHistory((prev) => [
      {
        id: `t-${Date.now()}`,
        label: `${tripData.origin.split(',')[0]} ➔ ${tripData.destination.split(',')[0]}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        net,
        commission,
        method: paymentMethod
      },
      ...prev
    ]);

    // El efectivo no pasa por pasarela: la comisión queda como deuda del conductor
    if (paymentMethod === 'cash') {
      const next = Number(applyCashCommissionDebt(walletBalance, commission));
      setWalletBalance(next);
      try {
        localStorage.setItem(WALLET_STORAGE_KEY, String(next));
      } catch (e) {}
      emitApi('WS', 'wallet_balance_updated', `driver:camila • wallet_balance=${next.toFixed(2)} (deuda por efectivo)`);
      if (next <= -BUSINESS_RULES.CASH_DEBT_LIMIT) setDebtModalOpen(true);
    }
  };

  const payCashDebt = () => {
    sound.success();
    setWalletBalance(0);
    setDebtModalOpen(false);
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, '0');
    } catch (e) {}
  };

  // "Ponerse en línea" bloqueado por deuda de efectivo o por tasa de aceptación baja
  const toggleDriverOnline = () => {
    if (!driverIsActive && walletStatus.isBlocked) {
      sound.tap();
      setDebtModalOpen(true);
      return;
    }
    if (!driverIsActive && isDriverBlockedByRate(activeDriver)) {
      sound.tap();
      return;
    }
    sound.tap();
    setDriverIsActive(!driverIsActive);
  };

  // Operaciones del Panel Admin (doc 7.2): KYC y cobranza de deudas de efectivo
  const setDriverVerification = (driverId, status) => {
    sound.tap();
    setDriverPool((prev) => prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: status } : d)));
    const driver = driverPool.find((d) => d.id === driverId);
    emitApi('REST', 'PATCH /api/admin/drivers/:id/kyc', `${driver?.name || driverId} → verification_status=${status}`);
  };

  const settleDriverDebt = (driverId) => {
    sound.success();
    const driver = driverPool.find((d) => d.id === driverId);
    if (driverId === 'camila') {
      setWalletBalance(0);
      try {
        localStorage.setItem(WALLET_STORAGE_KEY, '0');
      } catch (e) {}
    } else {
      setDriverPool((prev) => prev.map((d) => (d.id === driverId ? { ...d, walletBalance: 0 } : d)));
    }
    emitApi('REST', 'POST /api/admin/drivers/:id/settle', `${driver?.name || driverId} regularizó su billetera vía Yape/Plin`);
  };

  const resetSimulation = () => {
    sound.tap();
    setTripStatus(TRIP_STATUS.IDLE);
    setArrivalNotification(false);
    setPassengerStep(1);
    setDriverStep(2);
    setTripProgress(0);
    setSosActive(false);
    setLastCancellation(null);
    setAcceptedAt(null);
    setWaitedSeconds(0);
    setMatchQueue([]);
    setCandidateIndex(0);
    setRequestTimer(BUSINESS_RULES.MATCHING_TIMEOUT_SEC);
  };

  const triggerSos = (sender) => {
    sound.sosAlert();
    const coords = interpolateCoords(tripData.originCoords, tripData.destinationCoords, tripProgress);
    setSosEvents((prev) => [
      {
        id: `sos-${Date.now()}`,
        sender,
        coords,
        at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        destination: tripData.destination,
        driver: activeDriver.name,
        plate: tripData.plate || activeDriver.plate
      },
      ...prev
    ]);
    emitApi('WS', 'sos_triggered', `${sender} • ${coords[0]}, ${coords[1]} • ${activeDriver.name} (${tripData.plate || activeDriver.plate})`);
    setSosActive(true);
    setSosTriggeredBy(sender);
  };

  const dismissSos = () => {
    sound.tap();
    setSosActive(false);
    setSosTriggeredBy(null);
  };

  const sendChatMessage = (sender, text) => {
    sound.tap();
    setChatMessages((prev) => [
      ...prev,
      {
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Controles de sustentación: disparan los casos borde del documento sin esperar el reloj real
  const demoScenarios = {
    forceCandidateTimeout: () => advanceMatching('sin respuesta (demo)'),
    cancelWithoutFee: () => cancelTripByPassenger(1),
    // Si aún no hay viaje aceptado, se monta uno al instante para poder mostrar el cobro de S/ 3.00
    cancelWithFee: () => {
      const hasActiveTrip = [TRIP_STATUS.DRIVER_ACCEPTED, TRIP_STATUS.DRIVER_ARRIVED].includes(tripStatus);
      if (!hasActiveTrip) {
        requestTrip();
        acceptTripByDriver(currentCandidate?.id || driverPool[0]?.id);
      }
      cancelTripByPassenger(BUSINESS_RULES.FREE_CANCEL_MIN + 2, { wasAccepted: true });
    },
    simulateCashDebtLimit: () => {
      sound.tap();
      setWalletBalance(-BUSINESS_RULES.CASH_DEBT_LIMIT);
      setDriverIsActive(false);
      setDebtModalOpen(true);
      try {
        localStorage.setItem(WALLET_STORAGE_KEY, String(-BUSINESS_RULES.CASH_DEBT_LIMIT));
      } catch (e) {}
    }
  };

  return (
    <TransportContext.Provider
      value={{
        userProfile,
        saveUserProfile,
        viewMode,
        setViewMode,
        userGenderMode,
        setUserGenderMode,
        passengerStep,
        setPassengerStep,
        biometricsDone,
        setBiometricsDone,
        preferFemaleDriver,
        setPreferFemaleDriver,
        selectedRideCategory,
        setSelectedRideCategory,
        rideProfile,
        paymentMethod,
        setPaymentMethod,
        tripData,
        setTripData,
        tripStatus,
        requestTimer,
        businessRules: BUSINESS_RULES,
        driverPool,
        matchQueue,
        candidateIndex,
        currentCandidate,
        matchingLog,
        activeDriver,
        acceptedAt,
        waitedSeconds,
        lastCancellation,
        walletBalance,
        walletStatus,
        debtModalOpen,
        setDebtModalOpen,
        payCashDebt,
        tripHistory,
        driverStep,
        setDriverStep,
        driverIsActive,
        setDriverIsActive,
        toggleDriverOnline,
        driverEarningsToday,
        driverCompletedTripsCount,
        tripProgress,
        setTripProgress,
        sosActive,
        sosTriggeredBy,
        sosEvents,
        triggerSos,
        dismissSos,
        chatMessages,
        sendChatMessage,
        isChatOpen,
        setIsChatOpen,
        isMapPickerOpen,
        setIsMapPickerOpen,
        arrivalNotification,
        setArrivalNotification,
        apiLog,
        selectDestination,
        // Methods
        requestTrip,
        acceptTripByDriver,
        rejectTripByDriver,
        cancelTripByPassenger,
        notifyDriverArrived,
        startTripWithPin,
        finishTrip,
        resetSimulation,
        setDriverVerification,
        settleDriverDebt,
        demoScenarios
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};
