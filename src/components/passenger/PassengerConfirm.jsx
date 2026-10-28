import React from 'react';
import { ArrowLeft, Shield, CreditCard, Smartphone, Banknote, Check, X, Lock, RefreshCw } from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { getFareBreakdown, formatSoles, BUSINESS_RULES } from '../../utils/transportValidators';

const PAYMENT_OPTIONS = [
  { id: 'card', label: 'Visa •••• 1563', desc: 'Tarjeta de crédito predeterminada', icon: CreditCard },
  { id: 'yape', label: 'Yape / Plin', desc: 'Pago digital desde el celular', icon: Smartphone },
  { id: 'cash', label: 'Efectivo', desc: 'Pagas en mano a la conductora', icon: Banknote }
];

export const PassengerConfirm = () => {
  const {
    setPassengerStep,
    tripData,
    requestTrip,
    tripStatus,
    rideProfile,
    paymentMethod,
    setPaymentMethod,
    requestTimer,
    matchQueue,
    candidateIndex,
    currentCandidate,
    lastCancellation,
    cancelTripByPassenger
  } = useTransport();

  const isRequesting = tripStatus === TRIP_STATUS.REQUESTING;
  const noDrivers = tripStatus === TRIP_STATUS.NO_DRIVER;
  const isCancelled = tripStatus === TRIP_STATUS.CANCELLED;

  const breakdown = getFareBreakdown(
    tripData.distanceKm,
    tripData.durationMin,
    rideProfile.category,
    rideProfile.isNight
  );

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="screen-back-btn" onClick={() => setPassengerStep(4)}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              Revisa y confirma
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>5 DE 8</span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '14px' }}>
          Todo claro antes de pedir tu viaje.
        </p>

        {/* Protection Mode Card */}
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.08)',
            border: '1px solid rgba(0, 229, 153, 0.3)',
            borderRadius: '16px',
            padding: '12px 14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(0, 229, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={19} color="#00E599" />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#FFFFFF' }}>{rideProfile.label}</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Identidad biométrica validada • {tripData.time}</div>
            </div>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.15)', border: '1px solid rgba(0, 229, 153, 0.3)', padding: '3px 8px', borderRadius: '99px' }}>
            Protegido
          </span>
        </div>

        {/* Itinerary Summary */}
        <div className="card-glass" style={{ padding: '12px 14px', marginBottom: '12px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E599' }} />
            <span style={{ color: '#E2E8F0' }}>{tripData.origin}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#FFFFFF' }} />
            <span style={{ color: '#E2E8F0' }}>{tripData.destination}</span>
          </div>
        </div>

        {/* Cost Breakdown: fórmula del documento 5.1 */}
        <div className="card-glass" style={{ padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
            <span>Tarifa base</span>
            <span style={{ color: '#E2E8F0' }}>{formatSoles(breakdown.base)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
            <span>{tripData.distanceKm} km × S/ {breakdown.perKm.toFixed(2)}</span>
            <span style={{ color: '#E2E8F0' }}>{formatSoles(breakdown.kmCharge)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
            <span>{tripData.durationMin} min × S/ {BUSINESS_RULES.PER_MIN.toFixed(2)}</span>
            <span style={{ color: '#E2E8F0' }}>{formatSoles(breakdown.minCharge)}</span>
          </div>
          {breakdown.appliedMinimum && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#FCD34D', marginBottom: '6px' }}>
              <span>Tarifa mínima Chimbote</span>
              <span>{formatSoles(BUSINESS_RULES.MIN_FARE)}</span>
            </div>
          )}

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '10px 0 12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>Tarifa fija</div>
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>No cambia por tráfico ni por hora</div>
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#00E599' }}>
              {formatSoles(tripData.fixedFare)}
            </span>
          </div>
        </div>

        {/* Payment Method (card | yape | cash) */}
        <div style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
          Forma de pago
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {PAYMENT_OPTIONS.map((opt) => {
            const active = paymentMethod === opt.id;
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                onClick={() => setPaymentMethod(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: active ? '1.5px solid #00E599' : '1px solid var(--border-color)',
                  background: active ? 'rgba(0, 229, 153, 0.08)' : 'var(--bg-surface-elevated)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={active ? '#00E599' : '#94A3B8'} />
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#FFFFFF' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B' }}>{opt.desc}</div>
                  </div>
                </div>
                {active && <Check size={14} color="#00E599" strokeWidth={3} />}
              </div>
            );
          })}
        </div>

        {paymentMethod === 'cash' && (
          <div style={{ fontSize: '0.68rem', color: '#FCD34D', lineHeight: 1.35, marginBottom: '10px' }}>
            Pagarás {formatSoles(tripData.fixedFare)} en mano. Lumina descuenta {formatSoles(tripData.commissionFee)} de la billetera de la conductora.
          </div>
        )}

        {/* Trust disclosure */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textAlign: 'center', fontSize: '0.68rem', color: '#64748B' }}>
          <Lock size={11} color="#00E599" />
          <span>Se generará un PIN de abordaje único • Cancelar cuesta {formatSoles(BUSINESS_RULES.CANCEL_FEE)} después de {BUSINESS_RULES.FREE_CANCEL_MIN} min</span>
        </div>

        {/* Matching / cancellation state */}
        {(isRequesting || noDrivers || isCancelled) && (
          <div
            style={{
              marginTop: '12px',
              background: noDrivers || isCancelled ? 'rgba(244, 63, 94, 0.08)' : 'rgba(0, 229, 153, 0.06)',
              border: `1px solid ${noDrivers || isCancelled ? 'rgba(244, 63, 94, 0.35)' : 'rgba(0, 229, 153, 0.3)'}`,
              borderRadius: '14px',
              padding: '10px 12px'
            }}
          >
            {isRequesting && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Oferta a {currentCandidate?.name || 'conductora cercana'}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#94A3B8' }}>
                    Candidato {candidateIndex + 1} de {matchQueue.length} • expira en {requestTimer}s
                  </div>
                </div>
                <button
                  onClick={() => cancelTripByPassenger()}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                >
                  <X size={13} />
                  <span>Cancelar</span>
                </button>
              </div>
            )}

            {noDrivers && (
              <div style={{ fontSize: '0.74rem', color: '#FDA4AF', lineHeight: 1.4 }}>
                Ninguna conductora aceptó en {BUSINESS_RULES.MATCHING_TIMEOUT_SEC}s. Vuelve a buscar: se ofrecerá a la siguiente zona de Chimbote.
              </div>
            )}

            {isCancelled && lastCancellation && (
              <div style={{ fontSize: '0.74rem', color: '#FDA4AF', lineHeight: 1.4 }}>
                Viaje cancelado.{' '}
                {lastCancellation.fee > 0
                  ? `Cargamos ${formatSoles(lastCancellation.fee)} por esperar ${lastCancellation.minutes} min (va a la conductora).`
                  : 'Sin cargo: cancelaste dentro de los primeros 3 minutos.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Button */}
      <div style={{ marginTop: '14px' }}>
        {isRequesting ? (
          <button
            className="btn-primary"
            style={{ background: 'rgba(0, 229, 153, 0.15)', color: '#00E599', border: '1px solid #00E599' }}
            disabled
          >
            <span className="radar-sweep" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00E599', display: 'inline-block' }} />
            <span>Buscando conductora cercana...</span>
          </button>
        ) : noDrivers || isCancelled ? (
          <button className="btn-primary" onClick={requestTrip}>
            <RefreshCw size={17} />
            <span>Volver a buscar viaje</span>
          </button>
        ) : (
          <button className="btn-primary" onClick={requestTrip}>
            <Check size={18} />
            <span>Confirmar viaje • {formatSoles(tripData.fixedFare)}</span>
          </button>
        )}
      </div>
    </div>
  );
};
