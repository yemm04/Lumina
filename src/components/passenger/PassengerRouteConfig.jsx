import React, { useState } from 'react';
import { ArrowLeft, Clock, User, ShieldCheck, ChevronDown, Map as MapIcon } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { sound } from '../../utils/audioEffects';
import { calculateFareForMode, getRideModeProfile } from '../../utils/transportValidators';

export const PassengerRouteConfig = () => {
  const {
    setPassengerStep,
    tripData,
    selectedRideCategory,
    preferFemaleDriver,
    selectDestination,
    setIsMapPickerOpen
  } = useTransport();

  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const profile = getRideModeProfile(selectedRideCategory);

  // Destinos en Chimbote y Nuevo Chimbote (Áncash, Perú). La tarifa la fija el motor del documento.
  const predefinedDestinations = [
    { address: 'Megaplaza Chimbote, Av. Panamericana Norte', name: 'Megaplaza Chimbote', distance: 5.6, duration: 14 },
    { address: 'Plaza Mayor de Chimbote, Av. José Pardo', name: 'Plaza Mayor Chimbote (Centro)', distance: 8.2, duration: 20 },
    { address: 'Universidad Nacional del Santa, Av. Universitaria', name: 'Univ. Nacional del Santa (UNS)', distance: 1.8, duration: 6 },
    { address: 'Hospital Regional Eleazar Guzmán Barrón', name: 'Hospital Regional (N. Chimbote)', distance: 2.4, duration: 8 },
    { address: 'Malecón Grau / Bahía El Ferrol, Chimbote', name: 'Malecón Grau (Chimbote)', distance: 9.1, duration: 22 }
  ];

  const handleSelectDest = (dest) => {
    selectDestination(dest);
    setShowDestinationPicker(false);
  };

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="screen-back-btn" onClick={() => setPassengerStep(3)}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              Configura tu viaje
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>4 DE 8</span>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#00E599', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} />
          <span>{profile.label} • {preferFemaleDriver ? 'Conductora verificada activa' : 'Conductor verificado'}</span>
        </div>

        {/* Input Boxes for Origin & Destination in Chimbote */}
        <div className="card-glass" style={{ padding: '12px 14px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Origin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00E599', flexShrink: 0, boxShadow: '0 0 8px #00E599' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Origen (Recogida)</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF' }}>{tripData.origin}</div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginLeft: '20px' }} />

          {/* Destination */}
          <div
            onClick={() => setShowDestinationPicker(!showDestinationPicker)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#FFFFFF', border: '2px solid #00E599', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.62rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Destino (Toca para seleccionar)</span>
                <ChevronDown size={12} color="#00E599" />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF' }}>{tripData.destination}</div>
            </div>
          </div>

          {/* Selector de destinos sugeridos en Chimbote */}
          {showDestinationPicker && (
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.65rem', color: '#00E599', fontWeight: 700 }}>Rutas en Chimbote / N. Chimbote:</div>
              {predefinedDestinations.map((dest, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectDest(dest)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: tripData.destination === dest.address ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: tripData.destination === dest.address ? '1px solid #00E599' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{dest.name}</span>
                    <span style={{ color: '#94A3B8', marginLeft: '6px' }}>({dest.distance} km)</span>
                  </div>
                  <span style={{ color: '#00E599', fontWeight: 700 }}>
                    S/ {calculateFareForMode(dest.distance, dest.duration, selectedRideCategory).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón Destacado: Abrir Google Maps */}
        <button
          onClick={() => {
            sound.tap();
            setIsMapPickerOpen(true);
          }}
          style={{
            width: '100%',
            background: 'rgba(0, 229, 153, 0.12)',
            border: '1px solid rgba(0, 229, 153, 0.45)',
            color: '#00E599',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '10px',
            boxShadow: '0 0 15px rgba(0, 229, 153, 0.12)'
          }}
        >
          <MapIcon size={15} />
          <span>Abrir Google Maps (Chimbote y Nuevo Chimbote)</span>
        </button>

        {/* Time and Passenger info chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div className="card-glass" style={{ flex: 1, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={13} color="#00E599" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#E2E8F0' }}>{tripData.time}</span>
          </div>
          <div className="card-glass" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={13} color="#00E599" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#E2E8F0' }}>{tripData.passengers} pas.</span>
          </div>
        </div>

        {/* Interactive Night Route Map Preview */}
        <div style={{ marginBottom: '10px' }}>
          <InteractiveMap height="125px" progress={0} showVehicle={false} statusBadge="Av. Pacífico ➔ Panamericana" />
        </div>

        {/* Fixed Fare Guaranteed Box in Soles (S/) */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.08) 0%, rgba(14, 21, 25, 0.9) 100%)',
            border: '1.5px solid rgba(0, 229, 153, 0.35)',
            borderRadius: '14px',
            padding: '10px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
              Tarifa Fija Garantizada (Chimbote)
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.18)', padding: '2px 8px', borderRadius: '4px' }}>
              Sin tarifas dinámicas
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
            S/ {Number(tripData.fixedFare).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px', lineHeight: 1.35 }}>
            Base S/ 5.00 + S/ {profile.category === 'comfort' ? '2.30' : profile.isNight ? '2.10' : '1.80'}/km + S/ 0.15/min
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '2px', lineHeight: 1.35 }}>
            {tripData.durationMin} min • {tripData.distanceKm} km. Monitoreo satelital y seguro contra accidentes.
          </div>
        </div>
      </div>

      {/* Button */}
      <div style={{ marginTop: '10px' }}>
        <button
          className="btn-primary"
          onClick={() => {
            sound.tap();
            setPassengerStep(5);
          }}
        >
          <span>Revisar viaje</span>
        </button>
      </div>
    </div>
  );
};
