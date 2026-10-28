import React, { useState } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, CheckCircle2, Wallet } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { formatSoles } from '../../utils/transportValidators';

export const DriverEarnings = () => {
  const {
    driverEarningsToday,
    driverCompletedTripsCount,
    setDriverStep,
    tripHistory,
    walletStatus,
    payCashDebt,
    businessRules
  } = useTransport();

  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // La comisión se reconstruye desde el neto acreditado (85% de la tarifa fija)
  const totalCommission = Number(
    tripHistory.reduce((sum, t) => sum + (t.commission ?? (t.net / (1 - businessRules.COMMISSION_PCT / 100)) * (businessRules.COMMISSION_PCT / 100)), 0).toFixed(2)
  );
  const grossCollected = Number((Number(driverEarningsToday) + totalCommission).toFixed(2));
  const withdrawable = Number(Math.max(0, Number(driverEarningsToday) + walletStatus.balance).toFixed(2));

  const handleWithdraw = () => {
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawModal(false);
      setWithdrawSuccess(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="screen-back-btn" onClick={() => setDriverStep(2)}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              Ganancias de hoy
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>6 DE 6</span>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '16px' }}>
          Cierre 11:24 p.m. • Chimbote y Nuevo Chimbote
        </div>

        {/* Main Earnings Balance Card Peru */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%)',
            border: '1.5px solid rgba(0, 229, 153, 0.35)',
            borderRadius: '20px',
            padding: '18px',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
              Ganancia Neta Disponible (PEN)
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
              {driverCompletedTripsCount} viajes
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF' }}>
            S/ {Number(driverEarningsToday).toFixed(2)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#00E599', marginTop: '6px' }}>
            <TrendingUp size={13} />
            <span>+15% más que el promedio semanal en Chimbote</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div className="card-glass" style={{ padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Cobrado</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
              {formatSoles(grossCollected)}
            </div>
          </div>
          <div className="card-glass" style={{ padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Comisión {businessRules.COMMISSION_PCT}%</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F43F5E', marginTop: '2px' }}>
              {formatSoles(totalCommission)}
            </div>
          </div>
          <div className="card-glass" style={{ padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Tiempo</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38BDF8', marginTop: '2px' }}>3 h 42 m</div>
          </div>
        </div>

        {/* Wallet: deuda por viajes cobrados en efectivo (doc 8.1) */}
        <div
          style={{
            background: walletStatus.balance < 0 ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${walletStatus.balance < 0 ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-color)'}`,
            borderRadius: '14px',
            padding: '12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={18} color={walletStatus.balance < 0 ? '#F43F5E' : '#00E599'} />
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#FFFFFF' }}>Billetera Lumina</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                {walletStatus.balance < 0
                  ? `Deuda por comisión de cobros en efectivo`
                  : 'Saldo disponible para retiro'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: walletStatus.balance < 0 ? '#F43F5E' : '#00E599' }}>
              {formatSoles(walletStatus.balance)}
            </div>
            {walletStatus.balance < 0 && (
              <button
                onClick={payCashDebt}
                style={{
                  marginTop: '4px',
                  background: '#00E599',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '3px 8px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#070B0E',
                  cursor: 'pointer'
                }}
              >
                Pagar con Yape
              </button>
            )}
          </div>
        </div>

        {/* Trip List Breakdown Chimbote */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
          Desglose de viajes de hoy en Chimbote
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tripHistory.slice(0, 4).map((trip) => (
            <div key={trip.id} className="card-glass" style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {trip.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    {trip.time} • {trip.method === 'cash' ? `Efectivo · comisión ${formatSoles(trip.commission ?? 0)} en deuda` : trip.method === 'yape' ? 'Yape/Plin' : 'Tarjeta'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#00E599' }}>
                    +{formatSoles(trip.net)}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#00E599' }}>✔ Completado</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw Button: la deuda por efectivo se descuenta del retiro */}
      <div style={{ marginTop: '16px' }}>
        <button
          className="btn-primary"
          onClick={() => setWithdrawModal(true)}
          disabled={withdrawable <= 0}
          style={withdrawable <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <DollarSign size={18} />
          <span>{withdrawable > 0 ? `Retirar ${formatSoles(withdrawable)}` : 'Sin saldo retirable'}</span>
        </button>
      </div>

      {/* Modal de retiro Yape / Plin / Bancos Chimbote */}
      {withdrawModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 14, 0.96)',
            backdropFilter: 'blur(10px)',
            zIndex: 50,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {!withdrawSuccess ? (
            <>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 153, 0.15)',
                  border: '2px solid #00E599',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <DollarSign size={28} color="#00E599" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                Retiro Inmediato (Chimbote)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px', marginBottom: '18px' }}>
                Transferir {formatSoles(withdrawable)} a tu cuenta de ahorros (BCP, Interbank, BBVA o Yape/Plin).
                {walletStatus.balance < 0 && ` Se descuenta la deuda de ${formatSoles(walletStatus.debt)} por cobros en efectivo.`}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button className="btn-primary" onClick={handleWithdraw}>
                  Confirmar retiro gratuito
                </button>
                <button className="btn-secondary" onClick={() => setWithdrawModal(false)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 size={56} color="#00E599" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#00E599' }}>
                ¡Retiro Exitoso!
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#E2E8F0', marginTop: '4px' }}>
                Tus ganancias han sido transferidas a tu cuenta bancaria.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
