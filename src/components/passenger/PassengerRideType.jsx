import React from 'react';
import { ArrowLeft, Shield, Moon, Briefcase, GraduationCap, HeartHandshake, Check, Bike } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { calculateFare, RIDE_MODE_LIST } from '../../utils/transportValidators';

export const PassengerRideType = () => {
  const {
    setPassengerStep,
    selectedRideCategory,
    setSelectedRideCategory,
    preferFemaleDriver,
    setPreferFemaleDriver,
    tripData
  } = useTransport();

  const modeIcons = {
    estandar: Shield,
    nocturno: Moon,
    mototaxi: Bike,
    comfort: Briefcase,
    escolar: GraduationCap,
    adultos: HeartHandshake
  };

  const rideOptions = RIDE_MODE_LIST.map((mode) => ({
    ...mode,
    icon: modeIcons[mode.id] || Shield,
    isRecommended: mode.id === 'nocturno',
    fare: calculateFare(tripData.distanceKm, tripData.durationMin, mode.category, mode.isNight)
  }));

  const selectedMode = rideOptions.find((o) => o.id === selectedRideCategory) || rideOptions[0];

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="screen-back-btn" onClick={() => setPassengerStep(2)}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              ¿Cómo quieres viajar?
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>3 DE 8</span>
        </div>

        {/* Time Recommendation Note */}
        <div
          style={{
            background: 'rgba(0, 229, 153, 0.08)',
            border: '1px solid rgba(0, 229, 153, 0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#E2E8F0', lineHeight: 1.4 }}>
            <strong style={{ color: '#00E599' }}>Son las 11:00 p.m.</strong> Te recomendamos protección reforzada para este horario nocturno.
          </div>
        </div>

        {/* Ride Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {rideOptions.map((opt) => {
            const isSelected = selectedRideCategory === opt.id;
            const Icon = opt.icon;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedRideCategory(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #00E599' : '1px solid var(--border-color)',
                  background: isSelected ? 'rgba(0, 229, 153, 0.08)' : 'var(--bg-surface-elevated)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(0, 229, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={18} color={isSelected ? '#00E599' : '#94A3B8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {opt.label}
                      {opt.isRecommended && (
                        <span style={{ fontSize: '0.62rem', background: 'rgba(0, 229, 153, 0.2)', color: '#00E599', padding: '1px 6px', borderRadius: '4px' }}>
                          Recomendado
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{opt.desc}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isSelected ? '#00E599' : '#CBD5E1', fontFamily: 'var(--font-heading)' }}>
                    S/ {opt.fare.toFixed(2)}
                  </span>

                  <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid #00E599' : '2px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? '#00E599' : 'transparent'
                  }}
                >
                  {isSelected && <Check size={12} color="#070B0E" strokeWidth={3} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preferencia por Conductora (Figma switch) */}
        <div className="switch-container" style={{ marginTop: '8px' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
              Preferir una conductora
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              Buscaremos entre nuestras mejores conductoras verificadas
            </div>
          </div>
          <div
            className={`switch-toggle ${preferFemaleDriver ? 'active' : ''}`}
            onClick={() => setPreferFemaleDriver(!preferFemaleDriver)}
          >
            <div className="switch-thumb" />
          </div>
        </div>
      </div>

      {/* Button */}
      <div style={{ marginTop: '16px' }}>
        <button className="btn-primary" onClick={() => setPassengerStep(4)}>
          <span>Continuar con {selectedMode.label}</span>
        </button>
      </div>
    </div>
  );
};
