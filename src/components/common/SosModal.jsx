import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, Radio, UserCheck, X, MapPin } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';

export const SosModal = () => {
  const { sosActive, sosTriggeredBy, dismissSos, sosEvents, userProfile, tripData, userGenderMode } = useTransport();
  const [countdown, setCountdown] = useState(5);
  const [alertDispatched, setAlertDispatched] = useState(false);

  const isWomenMode = userGenderMode === 'women_priority';
  const rolPasajero = isWomenMode ? 'Pasajera' : 'Pasajero/a';
  const rolConductor = isWomenMode ? 'Conductora' : 'Conductor/a';

  const alert = sosEvents[0];
  const contactName = userProfile.emergencyContactName || 'Contacto de emergencia';
  const contactPhone = (userProfile.emergencyContactPhone || '').replace(/\D/g, '');

  useEffect(() => {
    if (sosActive) {
      setCountdown(5);
      setAlertDispatched(false);
    }
  }, [sosActive]);

  useEffect(() => {
    let timer;
    if (sosActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (sosActive && countdown === 0) {
      setAlertDispatched(true);
    }
    return () => clearInterval(timer);
  }, [sosActive, countdown]);

  if (!sosActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #1A0D11 0%, #10080B 100%)',
          border: '1.5px solid rgba(255, 59, 92, 0.5)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(255, 59, 92, 0.35)',
          color: '#FFFFFF',
          position: 'relative',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        <button
          onClick={dismissSos}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 59, 92, 0.18)',
              border: '2px solid #FF3B5C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 0 25px rgba(255, 59, 92, 0.5)'
            }}
          >
            <ShieldAlert size={32} color="#FF3B5C" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#FF3B5C' }}>
            PROTOCOLO SOS ACTIVADO
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '4px' }}>
            Alerta emitida por {sosTriggeredBy === 'passenger' ? rolPasajero : rolConductor}
          </p>
        </div>

        {/* Estado del despacho */}
        <div
          style={{
            background: 'rgba(255, 59, 92, 0.08)',
            border: '1px solid rgba(255, 59, 92, 0.25)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '18px'
          }}
        >
          {!alertDispatched ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#FDA4AF' }}>
                Conectando con Central Lumina en:
              </div>
              <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#FF3B5C', margin: '4px 0' }}>
                00:0{countdown}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Toca "Cancelar" abajo si presionaste por error accidental.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#4ADE80' }}>
                <Radio size={16} />
                <span>Alerta {alert?.id || 'SOS'} recibida por WebSocket en la Central Lumina</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#4ADE80' }}>
                <UserCheck size={16} />
                <span>{contactName} notificada con enlace de ruta en vivo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: '#FCD34D' }}>
                <PhoneCall size={16} />
                <span>Enlace prioritario con Central 105 (Policía Nacional del Perú - PNP)</span>
              </div>
            </div>
          )}
        </div>

        {/* Datos del viaje transmitidos a la central (doc 8.3) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '12px',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#CBD5E1'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={13} color="#FF3B5C" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {alert?.coords ? `${alert.coords[0]}, ${alert.coords[1]}` : `${tripData.originCoords?.[0]}, ${tripData.originCoords?.[1]}`}
            </span>
            <span style={{ color: '#64748B' }}>{alert?.at || ''}</span>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Ruta: </span>
            {tripData.origin.split(',')[0]} ➔ {(alert?.destination || tripData.destination).split(',')[0]}
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Vehículo: </span>
            {alert?.driver || ''} • placa {alert?.plate || tripData.plate || '—'}
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href="tel:105"
            style={{
              textDecoration: 'none',
              background: '#FF3B5C',
              color: '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(255, 59, 92, 0.4)'
            }}
          >
            <PhoneCall size={18} />
            Llamar a Central PNP (105 Perú)
          </a>

          <a
            href={`tel:+51${contactPhone}`}
            style={{
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '11px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <PhoneCall size={16} />
            Llamar a {contactName.split(' ')[0]} ({userProfile.emergencyContactPhone})
          </a>

          <button
            onClick={dismissSos}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#E2E8F0',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '0.88rem',
              padding: '11px',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Desactivar / Todo está seguro
          </button>
        </div>
      </div>
    </div>
  );
};
