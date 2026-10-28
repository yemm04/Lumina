import React, { useEffect } from 'react';
import { CheckCircle2, Bell, X, MapPin, Sparkles } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { sound } from '../../utils/audioEffects';

export const ArrivalNotification = () => {
  const {
    arrivalNotification,
    setArrivalNotification,
    tripData
  } = useTransport();

  useEffect(() => {
    if (arrivalNotification) {
      sound.success();
      const timer = setTimeout(() => {
        setArrivalNotification(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [arrivalNotification]);

  if (!arrivalNotification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        width: '90%',
        maxWidth: '420px',
        animation: 'slideDownNotification 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(14, 25, 20, 0.98) 0%, rgba(9, 14, 18, 0.98) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid #00E599',
          borderRadius: '18px',
          padding: '14px 18px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 153, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(0, 229, 153, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00E599',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(0, 229, 153, 0.4)'
          }}
        >
          <Bell size={20} className="radar-sweep" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: '#00E599' }}>
              ¡Llegaste a tu destino!
            </span>
            <span style={{ fontSize: '0.62rem', background: 'rgba(0, 229, 153, 0.2)', color: '#00E599', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
              Chimbote
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '2px', lineHeight: 1.35 }}>
            Has llegado con éxito a <strong>{tripData.destination}</strong>. Camila ha detenido la marcha con seguridad.
          </div>
        </div>

        <button
          onClick={() => setArrivalNotification(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
