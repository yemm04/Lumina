import React from 'react';
import { ShieldCheck, MapPin, DollarSign, Percent, Radio, Power, Sparkles, Navigation, AlertTriangle, Wallet } from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { DriverRequestAlert } from './DriverRequestAlert';
import { formatSoles } from '../../utils/transportValidators';

export const DriverDashboard = () => {
  const {
    driverIsActive,
    toggleDriverOnline,
    driverEarningsToday,
    driverCompletedTripsCount,
    tripStatus,
    setDriverStep,
    activeDriver,
    walletStatus,
    debtModalOpen,
    setDebtModalOpen,
    payCashDebt,
    businessRules
  } = useTransport();

  // Si entra solicitud en tiempo real, mostramos la pantalla de solicitud entrante
  if (tripStatus === TRIP_STATUS.REQUESTING) {
    return <DriverRequestAlert />;
  }

  const blockedByRate = activeDriver.acceptanceRate < businessRules.ACCEPTANCE_RATE_MIN;
  const blockedByDebt = walletStatus.isBlocked;

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Buenas noches, {activeDriver.name.split(' ')[0]}
            </h2>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
              {activeDriver.vehicleModel} • placa {activeDriver.plate}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>2 DE 6</span>
        </div>

        {/* Big Active Toggle Status */}
        <div
          onClick={toggleDriverOnline}
          style={{
            background: driverIsActive ? 'rgba(0, 229, 153, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1.5px solid ${driverIsActive ? '#00E599' : blockedByDebt || blockedByRate ? 'rgba(244, 63, 94, 0.45)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: '14px',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: driverIsActive ? '#00E599' : blockedByDebt || blockedByRate ? '#7F1D1D' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#070B0E'
              }}
            >
              <Power size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                {driverIsActive ? 'Estás activa' : blockedByDebt ? 'Bloqueada por deuda' : blockedByRate ? 'Fuera de matching' : 'Estás desconectada'}
              </div>
              <div style={{ fontSize: '0.7rem', color: driverIsActive ? '#00E599' : blockedByDebt ? '#FDA4AF' : blockedByRate ? '#FDA4AF' : '#94A3B8' }}>
                {driverIsActive
                  ? 'Recibiendo solicitudes nocturnas'
                  : blockedByDebt
                    ? `Paga ${formatSoles(walletStatus.debt)} vía Yape/Plin para volver`
                    : blockedByRate
                      ? `Recupera tu tasa sobre ${businessRules.ACCEPTANCE_RATE_MIN}% para recibir viajes`
                      : 'Toca para conectarte'}
              </div>
            </div>
          </div>

          <div className={`switch-toggle ${driverIsActive ? 'active' : ''}`}>
            <div className="switch-thumb" />
          </div>
        </div>

        {/* Operating Area & Demand Radar Map Chimbote */}
        <div className="card-glass" style={{ padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={13} color="#38BDF8" />
              <span>Zona: N. Chimbote ⇄ Chimbote</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#38BDF8' }}>Áncash</span>
          </div>

          <div style={{ position: 'relative', height: '125px', borderRadius: '12px', overflow: 'hidden' }}>
            <InteractiveMap height="125px" progress={30} showVehicle={false} statusBadge="Alta demanda N. Chimbote" />
          </div>
        </div>

        {/* Metrics Grid Peru */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          {/* Earnings today */}
          <div className="card-glass" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
              Hoy ({driverCompletedTripsCount} viajes)
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
              {formatSoles(driverEarningsToday)}
            </div>
          </div>

          {/* Commission */}
          <div className="card-glass" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
              Comisión Lumina
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: '#00E599', marginTop: '4px' }}>
              {businessRules.COMMISSION_PCT}%
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748B' }}>Tarifa justa y transparente</div>
          </div>

          {/* Acceptance rate: bloquea el matching por debajo del umbral (doc 8.2) */}
          <div className="card-glass" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
              Tasa de aceptación
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: blockedByRate ? '#F43F5E' : '#FFFFFF',
              marginTop: '4px'
            }}>
              {activeDriver.acceptanceRate}%
            </div>
            <div style={{ fontSize: '0.62rem', color: blockedByRate ? '#FDA4AF' : '#64748B' }}>
              Mínimo {businessRules.ACCEPTANCE_RATE_MIN}% para recibir viajes
            </div>
          </div>

          {/* Wallet: deuda acumulada por cobros en efectivo (doc 8.1) */}
          <div className="card-glass" style={{ padding: '12px' }}>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Wallet size={11} />
              <span>Billetera</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: walletStatus.balance < 0 ? '#F43F5E' : '#FFFFFF',
              marginTop: '4px'
            }}>
              {formatSoles(walletStatus.balance)}
            </div>
            <div style={{ fontSize: '0.62rem', color: walletStatus.balance < 0 ? '#FDA4AF' : '#64748B' }}>
              {walletStatus.balance < 0 ? `Deuda por efectivo (límite ${formatSoles(-businessRules.CASH_DEBT_LIMIT)})` : 'Sin deudas pendientes'}
            </div>
          </div>
        </div>

        {/* Trust Reminder */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color="#00E599" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.35 }}>
            Esta noche solo pasajeros con identidad verificada. Tu ruta también está monitoreada 24/7.
          </div>
        </div>
      </div>

      {/* Driver Actions */}
      <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
        <button
          className="btn-secondary"
          onClick={() => setDriverStep(6)}
          style={{ flex: 1, fontSize: '0.82rem', padding: '10px' }}
        >
          <span>Ver ganancias</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => setDriverStep(1)}
          style={{ flex: 1, fontSize: '0.82rem', padding: '10px' }}
        >
          <span>Revisión perfil</span>
        </button>
      </div>

      {/* Modal de deuda por cobros en efectivo (doc 8.1) */}
      {debtModalOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 14, 0.97)',
            backdropFilter: 'blur(10px)',
            zIndex: 60,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid #F43F5E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={26} color="#F43F5E" />
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            Paga tu deuda de {formatSoles(walletStatus.debt)}
          </h3>
          <p style={{ fontSize: '0.76rem', color: '#94A3B8', lineHeight: 1.45, maxWidth: '260px' }}>
            Acumulaste la comisión de tus viajes cobrados en efectivo. La plataforma bloquea el botón
            &quot;Ponerse en línea&quot; hasta que regularices la billetera vía Yape o Plin.
          </p>

          <button className="btn-primary" style={{ width: '100%' }} onClick={payCashDebt}>
            <DollarSign size={17} />
            <span>Pagar {formatSoles(walletStatus.debt)} con Yape/Plin</span>
          </button>

          <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setDebtModalOpen(false)}>
            <span>Ver después</span>
          </button>
        </div>
      )}
    </div>
  );
};
