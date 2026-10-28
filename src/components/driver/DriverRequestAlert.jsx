import React from 'react';
import { Star, ShieldCheck, MapPin, Navigation, Clock, Check, X } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { formatSoles } from '../../utils/transportValidators';

export const DriverRequestAlert = () => {
  const {
    requestTimer,
    tripData,
    userProfile,
    acceptTripByDriver,
    rejectTripByDriver,
    currentCandidate,
    activeDriver,
    candidateIndex,
    matchQueue,
    paymentMethod,
    businessRules
  } = useTransport();

  const offered = currentCandidate || activeDriver;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (requestTimer / businessRules.MATCHING_TIMEOUT_SEC) * circumference;

  // Iniciales del pasajero
  const initials = userProfile.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'CM';

  const commission = Number((tripData.fixedFare - tripData.driverFareNet).toFixed(2));

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', background: 'radial-gradient(circle at 50% 0%, rgba(0, 229, 153, 0.15) 0%, transparent 60%)' }}>
      <div>
        {/* Header with Circular Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Nueva solicitud
            </h2>
            <div style={{ fontSize: '0.72rem', color: '#00E599', fontWeight: 600 }}>
              Chimbote ⇄ Nuevo Chimbote • Oferta {candidateIndex + 1} de {Math.max(matchQueue.length, 1)}
            </div>
          </div>

          {/* SVG Circular Countdown */}
          <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="#00E599"
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span style={{ position: 'absolute', fontFamily: 'var(--font-mono)', fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>
              {requestTimer}s
            </span>
          </div>
        </div>

        {/* Passenger Card with Real Stored User Data */}
        <div className="card-glass" style={{ padding: '12px 14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#FFFFFF'
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{userProfile.fullName}</span>
                  <span style={{ fontSize: '0.62rem', background: 'rgba(0, 229, 153, 0.2)', color: '#00E599', padding: '1px 6px', borderRadius: '4px' }}>
                    DNI OK
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                  DNI: {userProfile.dni} • 4.9 ★ • Cel: {userProfile.phone}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#00E599' }}>
              <ShieldCheck size={14} />
              <span>Verificado</span>
            </div>
          </div>
        </div>

        {/* Route Preview with ETA Chimbote */}
        <div className="card-glass" style={{ padding: '12px 14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E599', marginTop: '4px' }} />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Punto de recogida</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{tripData.origin}</div>
              <div style={{ fontSize: '0.7rem', color: '#00E599', marginTop: '1px' }}>
                {offered.name} • a {offered.distanceKm} km ({offered.etaMin} min) • {offered.vehicleModel} placa {offered.plate}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginLeft: '18px' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#FFFFFF', marginTop: '4px' }} />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Destino final</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{tripData.destination}</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '1px' }}>{tripData.distanceKm} km • ~{tripData.durationMin} min de viaje</div>
            </div>
          </div>
        </div>

        {/* Financial Earnings Breakdown (Chimbote) */}
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.06)',
            border: '1.5px solid rgba(0, 229, 153, 0.3)',
            borderRadius: '16px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '4px' }}>
            <span>Tarifa fija cliente (Chimbote)</span>
            <span style={{ color: '#FFFFFF' }}>S/ {Number(tripData.fixedFare).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px' }}>
            <span>Comisión plataforma -15%</span>
            <span style={{ color: '#F43F5E' }}>-S/ {commission.toFixed(2)}</span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '8px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>Tu ganancia neta</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#00E599' }}>
              {formatSoles(tripData.driverFareNet)}
            </span>
          </div>

          <div style={{ fontSize: '0.66rem', color: paymentMethod === 'cash' ? '#FCD34D' : '#64748B', marginTop: '8px', lineHeight: 1.4 }}>
            {paymentMethod === 'cash'
              ? `Pago en efectivo: cobras ${formatSoles(tripData.fixedFare)} en mano y Lumina descuenta ${formatSoles(commission)} de tu billetera.`
              : `Pago digital: ${formatSoles(tripData.fixedFare)} acreditados directo en tu billetera.`}
          </div>
        </div>

        {/* Tasa de aceptación: debajo de 80% el matching deja de ofrecerte viajes (doc 8.2) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.7rem', color: '#94A3B8' }}>
          <span>Tu tasa de aceptación</span>
          <span style={{ fontWeight: 800, color: offered.acceptanceRate >= businessRules.ACCEPTANCE_RATE_MIN ? '#00E599' : '#F43F5E' }}>
            {offered.acceptanceRate}%
          </span>
        </div>
      </div>

      {/* Decision Buttons: Reject vs Accept */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '10px', marginTop: '16px' }}>
        <button
          className="btn-secondary"
          onClick={rejectTripByDriver}
          style={{ borderColor: 'rgba(244, 63, 94, 0.3)', color: '#FDA4AF' }}
          title={`Rechazar baja tu tasa de aceptación ${businessRules.REJECTION_PENALTY_PCT}%`}
        >
          <X size={16} />
          <span>Rechazar</span>
        </button>

        <button className="btn-primary" onClick={() => acceptTripByDriver(offered.id)}>
          <Check size={18} />
          <span>Aceptar • {formatSoles(tripData.driverFareNet)}</span>
        </button>
      </div>
    </div>
  );
};
