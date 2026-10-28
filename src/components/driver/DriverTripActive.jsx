import React, { useState } from 'react';
import { CornerUpLeft, ShieldCheck, AlertTriangle, Check, Lock, Radio, Eye, EyeOff } from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { formatSoles } from '../../utils/transportValidators';

export const DriverTripActive = () => {
  const {
    tripStatus,
    tripProgress,
    tripData,
    userProfile,
    paymentMethod,
    startTripWithPin,
    finishTrip,
    triggerSos
  } = useTransport();

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showDemoPin, setShowDemoPin] = useState(false);

  const isTripUnderway = tripStatus === TRIP_STATUS.IN_PROGRESS;

  const handleVerifyPin = () => {
    if (startTripWithPin(enteredPin)) {
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* If waiting for PIN */}
      {!isTripUnderway ? (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Verifica el PIN de {userProfile.fullName.split(' ')[0]}
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>5 DE 6</span>
            </div>

            <div className="card-glass" style={{ padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 153, 0.15)',
                  border: '1.5px solid #00E599',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto'
                }}
              >
                <Lock size={22} color="#00E599" />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                PIN de 4 dígitos del Pasajero
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                Solicita a {userProfile.fullName.split(' ')[0]} el código de 4 dígitos que ve en su pantalla.
                Sin el PIN correcto el viaje no puede iniciar.
              </div>

              {/* PIN Inputs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0 10px 0' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value.replace(/\D/g, ''));
                    setPinError(false);
                  }}
                  placeholder="••••"
                  style={{
                    width: '180px',
                    height: '52px',
                    background: '#0B1115',
                    border: `2px solid ${pinError ? '#FF3B5C' : '#00E599'}`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#00E599',
                    letterSpacing: '10px',
                    outline: 'none'
                  }}
                />
              </div>

              {pinError && (
                <div style={{ color: '#FF3B5C', fontSize: '0.75rem', fontWeight: 600 }}>
                  El PIN no coincide. El viaje sigue bloqueado hasta verificarlo con el pasajero.
                </div>
              )}

              <button
                onClick={() => setShowDemoPin((prev) => !prev)}
                style={{
                  marginTop: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  color: '#94A3B8',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {showDemoPin ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showDemoPin ? `PIN del pasajero: ${tripData.pin}` : 'Modo sustentación: leer el PIN del pasajero'}</span>
              </button>
            </div>
          </div>

          <div>
            <button
              className="btn-primary"
              onClick={handleVerifyPin}
              disabled={enteredPin.length !== 4}
              style={enteredPin.length !== 4 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              <Check size={18} />
              <span>Confirmar PIN e Iniciar Viaje</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active trip in progress */
        <>
          {/* Top GPS Instruction Chimbote */}
          <div
            style={{
              background: 'rgba(7, 11, 14, 0.96)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--border-color)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#00E599',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#070B0E'
                }}
              >
                <CornerUpLeft size={22} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>Continúa hacia Panamericana</div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Rumbo a: {tripData.destination.split(',')[0]}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00E599' }}>
                {Math.max(0.2, Number((tripData.distanceKm * (1 - tripProgress / 100)).toFixed(1)))} km
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                {Math.max(1, Math.round(tripData.durationMin * (1 - tripProgress / 100)))} min
              </div>
            </div>
          </div>

          {/* Navigation Map with live beacon dot */}
          <div style={{ flex: 1, position: 'relative' }}>
            <InteractiveMap
              height="100%"
              progress={tripProgress}
              showVehicle={true}
              statusBadge="GPS Activo • Chimbote"
            />
          </div>

          {/* Bottom Driver Controls */}
          <div
            style={{
              background: 'rgba(10, 16, 20, 0.96)',
              backdropFilter: 'blur(16px)',
              borderTop: '1px solid var(--border-color)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10
            }}
          >
            {/* Security Monitoring Pill */}
            <div
              style={{
                background: 'rgba(0, 229, 153, 0.08)',
                border: '1px solid rgba(0, 229, 153, 0.25)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={14} color="#00E599" />
                <span style={{ fontSize: '0.72rem', color: '#E2E8F0', fontWeight: 600 }}>
                  Ruta protegida • PNP 105 Chimbote
                </span>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#00E599', fontWeight: 700 }}>
                PIN CONFIRMADO
              </span>
            </div>

            {/* Passenger and Shared info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94A3B8' }}>
              <span>{userProfile.fullName} (Aviso a: {userProfile.emergencyContactName.split(' ')[0]})</span>
              <span style={{ color: '#00E599', fontWeight: 700 }}>
                {paymentMethod === 'cash'
                  ? `${formatSoles(tripData.fixedFare)} en mano · debes ${formatSoles(tripData.commissionFee)}`
                  : `+${formatSoles(tripData.driverFareNet)}`}
              </span>
            </div>

            {/* SOS and End Trip Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '10px' }}>
              <button
                className="btn-danger-sos"
                style={{ padding: '12px', fontSize: '0.85rem' }}
                onClick={() => triggerSos('driver')}
              >
                <AlertTriangle size={16} />
                <span>SOS</span>
              </button>

              <button className="btn-primary" onClick={finishTrip}>
                <Check size={18} />
                <span>Finalizar viaje</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
