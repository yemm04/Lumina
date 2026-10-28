import React from 'react';
import { TransportProvider, useTransport } from './context/TransportContext';
import { HeaderBar } from './components/common/HeaderBar';
import { SosModal } from './components/common/SosModal';
import { InteractiveMapModal } from './components/common/InteractiveMapModal';
import { ArrivalNotification } from './components/common/ArrivalNotification';
import { PassengerPhone } from './components/passenger/PassengerPhone';
import { DriverPhone } from './components/driver/DriverPhone';
import { AdminPanel } from './components/admin/AdminPanel';
import { ShieldCheck, Eye, Sparkles, Navigation, Layers, ChevronRight } from 'lucide-react';

const AppContent = () => {
  const {
    viewMode,
    passengerStep,
    setPassengerStep,
    driverStep,
    setDriverStep,
    tripStatus,
    demoScenarios
  } = useTransport();

  const passengerScreens = [
    { step: 1, label: 'Bienvenida' },
    { step: 2, label: 'Biometría' },
    { step: 3, label: 'Modalidad' },
    { step: 4, label: 'Ruta' },
    { step: 5, label: 'Confirmar' },
    { step: 6, label: 'Asignación' },
    { step: 7, label: 'En camino' },
    { step: 8, label: 'Llegada' }
  ];

  const driverScreens = [
    { step: 1, label: 'Requisitos' },
    { step: 2, label: 'Dashboard' },
    { step: 3, label: 'Alerta' },
    { step: 4, label: 'Recogida' },
    { step: 5, label: 'En curso' },
    { step: 6, label: 'Ganancias' }
  ];

  const edgeCases = [
    { key: 'timeout', label: 'Conductora no responde', run: demoScenarios.forceCandidateTimeout },
    { key: 'cancelFree', label: 'Cancelación gratis', run: () => demoScenarios.cancelWithoutFee() },
    { key: 'cancelFee', label: 'Cancelación +3 min (S/ 3)', run: () => demoScenarios.cancelWithFee() },
    { key: 'debt', label: 'Deuda efectivo S/ 50', run: demoScenarios.simulateCashDebtLimit }
  ];

  return (
    <div className="lumina-workspace">
      {/* Top Header Bar */}
      <HeaderBar />

      {/* Main Showcase Stage */}
      <main className="stage-container">
        {/* Vista Pasajero */}
        {(viewMode === 'dual' || viewMode === 'passenger') && (
          <PassengerPhone />
        )}

        {/* Vista Conductor */}
        {(viewMode === 'dual' || viewMode === 'driver') && (
          <DriverPhone />
        )}

        {/* Panel Administrativo (Backoffice, doc 7.2) */}
        {viewMode === 'admin' && <AdminPanel />}
      </main>

      {/* Presentation Stepper Toolbar (Herramienta para sustentación académica) */}
      <footer
        style={{
          background: 'rgba(10, 16, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-color)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>
            <Layers size={14} color="#00E599" />
            <span>Navegación Rápida para Sustentación:</span>
          </div>

          {/* Stepper Pasajero */}
          <div style={{ display: 'flex', gap: '4px', background: '#070B0E', padding: '3px 6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: '#00E599', fontWeight: 700, padding: '2px 4px' }}>Pasajero:</span>
            {passengerScreens.map((s) => (
              <button
                key={s.step}
                onClick={() => setPassengerStep(s.step)}
                style={{
                  background: passengerStep === s.step ? '#00E599' : 'transparent',
                  color: passengerStep === s.step ? '#070B0E' : '#94A3B8',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title={s.label}
              >
                {s.step}. {s.label}
              </button>
            ))}
          </div>

          {/* Stepper Conductor */}
          <div style={{ display: 'flex', gap: '4px', background: '#070B0E', padding: '3px 6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, padding: '2px 4px' }}>Conductor:</span>
            {driverScreens.map((s) => (
              <button
                key={s.step}
                onClick={() => setDriverStep(s.step)}
                style={{
                  background: driverStep === s.step ? '#38BDF8' : 'transparent',
                  color: driverStep === s.step ? '#070B0E' : '#94A3B8',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title={s.label}
              >
                {s.step}. {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Casos borde del documento (Parte VII) activables sin esperar el reloj real */}
          <div style={{ display: 'flex', gap: '4px', background: '#070B0E', padding: '3px 6px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: '#F43F5E', fontWeight: 700, padding: '2px 4px' }}>Casos borde:</span>
            {edgeCases.map((c) => (
              <button
                key={c.key}
                onClick={c.run}
                style={{
                  background: 'transparent',
                  color: '#94A3B8',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#F43F5E'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E599' }} />
            <span>Estado del ciclo: <strong style={{ color: '#E2E8F0' }}>{tripStatus}</strong></span>
          </div>
        </div>
      </footer>

      {/* Emergency SOS Modal Global */}
      <SosModal />

      {/* Interactive Map Picker Modal for Google Maps (Chimbote) */}
      <InteractiveMapModal />

      {/* Arrival Destination Notification Banner */}
      <ArrivalNotification />
    </div>
  );
};

export default function App() {
  return (
    <TransportProvider>
      <AppContent />
    </TransportProvider>
  );
}
