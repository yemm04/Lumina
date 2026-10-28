import React from 'react';
import { Share2, Headphones, AlertTriangle, Navigation } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { InteractiveMap } from '../common/InteractiveMap';

export const PassengerTripInProgress = () => {
  const {
    tripProgress,
    tripData,
    userProfile,
    activeDriver,
    triggerSos
  } = useTransport();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mi viaje seguro con Lumina',
        text: `Voy en camino a ${tripData.destination} en un ${tripData.vehicle} con ${activeDriver.name}, placa ${tripData.plate}. Sigue mi ruta en vivo cifrada.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert(`Enlace de monitoreo enviado a ${userProfile.emergencyContactName}: https://lumina.segura/track/chimbote/8f92a1`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Header Floating */}
      <div
        style={{
          padding: '14px 20px',
          background: 'rgba(7, 11, 14, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Hacia {tripData.destination.split(',')[0]}</span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(0, 229, 153, 0.2)', color: '#00E599', padding: '1px 6px', borderRadius: '4px' }}>
              GPS Chimbote
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            {Math.max(1, Math.round(tripData.durationMin * (1 - tripProgress / 100)))} min restantes • {Math.max(0.1, Number((tripData.distanceKm * (1 - tripProgress / 100)).toFixed(1)))} km
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>
          7 DE 8
        </div>
      </div>

      {/* Full Live Map with Active Telemetry */}
      <div style={{ flex: 1, position: 'relative' }}>
        <InteractiveMap
          height="100%"
          progress={tripProgress}
          showVehicle={true}
          statusBadge="Monitoreo activo 24/7"
        />

        {/* Telemetry pill overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(10, 16, 20, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.68rem',
            color: '#E2E8F0'
          }}
        >
          <Navigation size={12} color="#00E599" />
          <span>Km {(tripData.distanceKm * tripProgress / 100).toFixed(1)} de {tripData.distanceKm} • 38 km/h</span>
        </div>
      </div>

      {/* Bottom Floating Control Panel */}
      <div
        style={{
          background: 'rgba(10, 16, 20, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 10
        }}
      >
        {/* Driver & Car Summary Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '8px 12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>{activeDriver.name.split(' ')[0]} • {tripData.vehicle}</span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#00E599', fontWeight: 700 }}>{tripData.plate || activeDriver.plate}</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{activeDriver.rating} ★</span>
        </div>

        {/* Live Protection Status: Compartiendo con contacto de confianza */}
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.06)',
            border: '1px solid rgba(0, 229, 153, 0.25)',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E599' }} className="radar-sweep" />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                Compartiendo con {userProfile.emergencyContactName.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                {userProfile.emergencyContactName} • GPS en vivo activo
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
            ACTIVO
          </span>
        </div>

        {/* BOTON DE PANICO SOS */}
        <button
          className="btn-danger-sos"
          onClick={() => triggerSos('passenger')}
        >
          <AlertTriangle size={18} />
          <span>Ayuda de emergencia (SOS)</span>
        </button>

        {/* Bottom Actions: Share & Support */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleShare}>
            <Share2 size={15} color="#00E599" />
            <span>Compartir</span>
          </button>

          <button className="btn-secondary" onClick={() => alert('Conectando con soporte humano Lumina 24/7...')}>
            <Headphones size={15} color="#00E599" />
            <span>Soporte 24/7</span>
          </button>
        </div>
      </div>
    </div>
  );
};
