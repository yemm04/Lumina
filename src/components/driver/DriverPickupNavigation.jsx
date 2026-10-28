import React from 'react';
import { Navigation, CornerUpRight, MessageSquare, Check, ShieldCheck, MapPin } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { InteractiveMap } from '../common/InteractiveMap';

export const DriverPickupNavigation = () => {
  const {
    tripData,
    userProfile,
    notifyDriverArrived,
    setDriverStep
  } = useTransport();

  const handleArrived = () => {
    notifyDriverArrived();
    setDriverStep(5);
  };

  const initials = userProfile.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'CM';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Top Turn-by-Turn Instruction Banner */}
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
            <CornerUpRight size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FFFFFF' }}>Gira a la derecha</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>En 200 m • Hacia Av. Pacífico</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#00E599' }}>0.8 km</div>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>2 min</div>
        </div>
      </div>

      {/* Map to Pickup Point */}
      <div style={{ flex: 1, position: 'relative' }}>
        <InteractiveMap
          height="100%"
          progress={10}
          showVehicle={true}
          statusBadge="A punto de recogida • N. Chimbote"
        />
      </div>

      {/* Bottom Panel with Passenger details and 'Ya llegué' button */}
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
        {/* Passenger info with dynamic stored name */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{userProfile.fullName}</span>
                <span style={{ fontSize: '0.65rem', color: '#00E599' }}>• 4.9 ★</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Punto: {tripData.origin}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.68rem', color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            DNI OK
          </div>
        </div>

        {/* Security reminder */}
        <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.35 }}>
          {userProfile.fullName.split(' ')[0]} verificó su identidad. Pídele su <strong>PIN de 4 dígitos</strong> al subir: sin ese código no podrás iniciar el viaje.
        </div>

        {/* Action Buttons: Message & I have arrived */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => alert(`Abriendo chat seguro con ${userProfile.fullName}...`)}>
            <MessageSquare size={16} />
            <span>Mensaje</span>
          </button>

          <button className="btn-primary" onClick={handleArrived}>
            <Check size={18} strokeWidth={2.5} />
            <span>¡Ya llegué al punto!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
