import React, { useState } from 'react';
import { ArrowLeft, Star, ShieldCheck, Car, MessageSquare, Phone, Lock, Send, X } from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { BUSINESS_RULES, formatSoles } from '../../utils/transportValidators';

export const PassengerDriverEnRoute = () => {
  const {
    setPassengerStep,
    tripData,
    tripStatus,
    chatMessages,
    sendChatMessage,
    activeDriver,
    waitedSeconds,
    cancelTripByPassenger
  } = useTransport();

  const [chatOpen, setChatOpen] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [showCancelSheet, setShowCancelSheet] = useState(false);

  const hasArrived = tripStatus === TRIP_STATUS.DRIVER_ARRIVED;
  const waitedMinutes = waitedSeconds / 60;
  const wouldPayFee = waitedMinutes >= BUSINESS_RULES.FREE_CANCEL_MIN;
  const firstName = activeDriver.name.split(' ')[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    sendChatMessage('passenger', newMsg);
    setNewMsg('');
  };

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', position: 'relative' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="screen-back-btn" onClick={() => setPassengerStep(5)}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              {firstName} va por ti
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>6 DE 8</span>
        </div>

        {/* Arrival status banner */}
        <div
          style={{
            background: hasArrived ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${hasArrived ? '#00E599' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '12px',
            padding: '8px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasArrived ? '#00E599' : '#F59E0B' }} />
            <span style={{ fontSize: '0.75rem', color: hasArrived ? '#00E599' : '#E2E8F0', fontWeight: 600 }}>
              {hasArrived ? `¡${firstName} te espera en el lobby principal!` : `Llega en ${activeDriver.etaMin} min • ${tripData.origin.split(',')[0]}`}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
            {Math.floor(waitedSeconds / 60)}:{String(waitedSeconds % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Driver Profile Card */}
        <div className="card-glass" style={{ padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                  border: '2px solid #00E599',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#00E599'
                }}
              >
                {activeDriver.initials}
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{activeDriver.name}</span>
                  <span style={{ fontSize: '0.62rem', background: 'rgba(0, 229, 153, 0.2)', color: '#00E599', padding: '1px 6px', borderRadius: '4px' }}>
                    Verificada
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#CBD5E1', marginTop: '2px' }}>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{activeDriver.rating}</span>
                  <span style={{ color: '#64748B' }}>• {activeDriver.tripsCount} viajes</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '3px 8px', borderRadius: '99px' }}>
              <ShieldCheck size={12} />
              <span>Biometría</span>
            </div>
          </div>
        </div>

        {/* Vehicle Card */}
        <div className="card-glass" style={{ padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={22} color="#00E599" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{tripData.vehicle}</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Confirma placa, vehículo y foto antes de subir</div>
              </div>
            </div>

            {/* License Plate Banner Peru */}
            <div
              style={{
                background: '#0B1115',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                padding: '4px 10px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.55rem', color: '#00E599', fontWeight: 800, letterSpacing: '1px' }}>PERÚ</div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '1.5px'
                }}
              >
                {tripData.plate || activeDriver.plate}
              </div>
            </div>
          </div>
        </div>

        {/* PIN DE SEGURIDAD (4 DIGITOS) */}
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.05)',
            border: '1px solid rgba(0, 229, 153, 0.35)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94A3B8', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Lock size={12} color="#00E599" />
            <span>PIN de Inicio de Viaje</span>
          </div>

          <div className="pin-display-group">
            {tripData.pin.split('').map((digit, i) => (
              <div key={i} className="pin-digit-box">
                {digit}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '10px' }}>
            PIN generado para este viaje. Dáselo a {firstName} solo dentro del vehículo correcto.
          </div>
        </div>
      </div>

      {/* Action Buttons: Message, Call & Cancel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setChatOpen(true)}>
            <MessageSquare size={16} />
            <span>Mensaje</span>
          </button>

          <a
            href="tel:+51999888777"
            className="btn-secondary"
            style={{ textDecoration: 'none', color: '#FFFFFF' }}
            title="Llamada confidencial por número virtual: ninguna de las dos partes ve el número real"
          >
            <Phone size={16} />
            <span>Llamar</span>
          </a>
        </div>

        <button
          onClick={() => setShowCancelSheet(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '8px',
            color: '#94A3B8',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Cancelar viaje ({wouldPayFee ? `cargo ${formatSoles(BUSINESS_RULES.CANCEL_FEE)}` : 'sin cargo'})
        </button>
      </div>

      {/* Hoja de cancelación con la regla documentada (doc 8.2) */}
      {showCancelSheet && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 14, 0.97)',
            backdropFilter: 'blur(10px)',
            zIndex: 70,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '14px',
            textAlign: 'center'
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
              ¿Cancelar este viaje?
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '6px', lineHeight: 1.45 }}>
              {firstName} lleva en camino <strong style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{Math.floor(waitedSeconds / 60)}:{String(waitedSeconds % 60).padStart(2, '0')}</strong> min.{' '}
              {wouldPayFee
                ? `Pasados ${BUSINESS_RULES.FREE_CANCEL_MIN} min se cobra ${formatSoles(BUSINESS_RULES.CANCEL_FEE)} por el tiempo perdido, y va directo a su billetera.`
                : `Dentro de los primeros ${BUSINESS_RULES.FREE_CANCEL_MIN} min la cancelación es gratis.`}
            </p>
          </div>

          <button
            className="btn-danger-sos"
            onClick={() => {
              cancelTripByPassenger();
              setShowCancelSheet(false);
            }}
          >
            <X size={16} />
            <span>Cancelar viaje</span>
          </button>

          <button className="btn-secondary" onClick={() => setShowCancelSheet(false)}>
            <span>Seguir esperando</span>
          </button>
        </div>
      )}

      {/* Modal de Chat rápido */}
      {chatOpen && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 11, 14, 0.98)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Chat con {firstName}</div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'passenger' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'passenger' ? '#00E599' : '#1A242C',
                  color: msg.sender === 'passenger' ? '#070B0E' : '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '0.8rem'
                }}
              >
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.7, textAlign: 'right', marginTop: '2px' }}>{msg.time}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1,
                background: '#121A20',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <button type="submit" style={{ background: '#00E599', border: 'none', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Send size={16} color="#070B0E" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
