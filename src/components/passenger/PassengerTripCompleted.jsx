import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, ShieldCheck, FileText, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTransport } from '../../context/TransportContext';

export const PassengerTripCompleted = () => {
  const { tripData, resetSimulation, userGenderMode, activeDriver, paymentMethod } = useTransport();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Conducción segura', 'Amable']);

  const isWomenMode = userGenderMode === 'women_priority';
  const paymentLabel = paymentMethod === 'cash' ? 'Efectivo entregado en mano' : paymentMethod === 'yape' ? 'Yape / Plin' : 'Visa •••• 1563';

  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00E599', '#38BDF8', '#FFFFFF']
    });
  }, []);

  const tagsList = ['Conducción segura', 'Amable', 'Puntual', 'Vehículo impecable'];

  const toggleTag = (t) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', margin: '14px 0 20px 0' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(0, 229, 153, 0.15)',
              border: '2px solid #00E599',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 0 30px rgba(0, 229, 153, 0.35)'
            }}
          >
            <CheckCircle size={38} color="#00E599" strokeWidth={2.5} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>
            {isWomenMode ? '¡Llegaste segura!' : '¡Llegaste seguro!'}
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
            11:24 p.m. • {tripData.destination}
          </p>
        </div>

        {/* Rating Section */}
        <div className="card-glass" style={{ padding: '16px', textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '10px' }}>
            ¿Cómo estuvo tu viaje con {activeDriver.name.split(' ')[0]}?
          </div>

          {/* 5 Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                onClick={() => setRating(star)}
                fill={star <= rating ? '#00E599' : 'none'}
                color={star <= rating ? '#00E599' : '#64748B'}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
              />
            ))}
          </div>

          {/* Feedback Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            {tagsList.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <div
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '99px',
                    cursor: 'pointer',
                    border: active ? '1px solid #00E599' : '1px solid var(--border-color)',
                    background: active ? 'rgba(0, 229, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#00E599' : '#94A3B8',
                    transition: 'all 0.2s'
                  }}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </div>

        {/* Receipt Box */}
        <div className="card-glass" style={{ padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            <FileText size={12} />
            <span>Recibo del viaje • {paymentLabel}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>
            <span>Tarifa fija ({tripData.distanceKm} km • {tripData.durationMin} min)</span>
            <span style={{ color: '#FFFFFF' }}>S/ {Number(tripData.fixedFare).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>
            <span>Monitoreo y seguro SOAT Perú</span>
            <span style={{ color: '#00E599' }}>Incluido</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '8px' }}>
            <span>PIN de abordaje verificado</span>
            <span style={{ color: '#00E599' }}>Correcto</span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '8px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>Total final (Perú)</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#00E599' }}>
              S/ {Number(tripData.fixedFare).toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748B' }}>
          Guardado automáticamente en tu historial
        </div>
      </div>

      {/* Button */}
      <div style={{ marginTop: '16px' }}>
        <button className="btn-primary" onClick={resetSimulation}>
          <span>Listo</span>
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};
