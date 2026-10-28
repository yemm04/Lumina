import React, { useState } from 'react';
import { ShieldCheck, Lock, Tag, ArrowRight, Sparkles, User, Phone, FileText, HeartHandshake, Check } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { sound } from '../../utils/audioEffects';

export const PassengerWelcome = () => {
  const { setPassengerStep, userGenderMode, userProfile, saveUserProfile } = useTransport();
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Formulario de registro momentáneo del usuario
  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || '',
    dni: userProfile.dni || '',
    phone: userProfile.phone || '',
    emergencyContactName: userProfile.emergencyContactName || ''
  });

  const isWomenMode = userGenderMode === 'women_priority';

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    saveUserProfile(formData);
    setShowRegisterForm(false);
    setPassengerStep(2);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Top Branding Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00E599 0%, #009966 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#070B0E'
              }}
            >
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Lumina
            </span>
          </div>

          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.12)', border: '1px solid rgba(0, 229, 153, 0.3)', padding: '2px 8px', borderRadius: '99px' }}>
            Chimbote • N. Chimbote
          </span>
        </div>

        {!showRegisterForm ? (
          <>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 229, 153, 0.1)', border: '1px solid rgba(0, 229, 153, 0.3)', borderRadius: '99px', padding: '3px 10px', marginBottom: '10px' }}>
              <Sparkles size={11} color="#00E599" />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transporte con Respaldo en Áncash
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.15, color: '#FFFFFF', marginBottom: '8px' }}>
              {isWomenMode ? 'Llega segura.' : 'Llega seguro.'} <br />
              <span style={{ color: '#00E599' }}>Chimbote & Nuevo Chimbote</span>
            </h1>

            {/* Description */}
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.45, marginBottom: '16px' }}>
              Conductores verificados con antecedentes, tarifa fija antes de salir y monitoreo activo en tiempo real.
            </p>

            {/* User Profile Card Preview */}
            <div
              onClick={() => setShowRegisterForm(true)}
              style={{
                background: 'rgba(0, 229, 153, 0.06)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                borderRadius: '14px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0, 229, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E599', fontWeight: 800 }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>{userProfile.fullName}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>DNI: {userProfile.dni} • Cel: {userProfile.phone}</div>
                </div>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#00E599', textDecoration: 'underline' }}>Editar</span>
            </div>

            {/* Security Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div className="card-glass" style={{ padding: '8px 6px', textAlign: 'center', borderRadius: '12px' }}>
                <ShieldCheck size={16} color="#00E599" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#E2E8F0' }}>DNI Verificado</div>
              </div>
              <div className="card-glass" style={{ padding: '8px 6px', textAlign: 'center', borderRadius: '12px' }}>
                <Lock size={16} color="#00E599" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#E2E8F0' }}>PIN 4 dígitos</div>
              </div>
              <div className="card-glass" style={{ padding: '8px 6px', textAlign: 'center', borderRadius: '12px' }}>
                <Tag size={16} color="#00E599" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: '#E2E8F0' }}>Tarifa fija S/</div>
              </div>
            </div>
          </>
        ) : (
          /* Formulario de Registro / Almacenamiento Momentáneo */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#00E599', marginBottom: '2px' }}>
              Datos de tu cuenta (Pasajero)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '8px' }}>
              Tus datos se almacenarán para el viaje y el conductor los verá al confirmar.
            </div>

            <div>
              <label style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Nombres y Apellidos
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ej. Juan Pérez"
                style={{
                  width: '100%',
                  background: '#121A20',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                  marginTop: '3px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  required
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="72418932"
                  style={{
                    width: '100%',
                    background: '#121A20',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    outline: 'none',
                    marginTop: '3px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Celular (Perú)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="943 512 890"
                  style={{
                    width: '100%',
                    background: '#121A20',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    outline: 'none',
                    marginTop: '3px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.68rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Contacto de Emergencia SOS
              </label>
              <input
                type="text"
                required
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Ej. Mamá (Elena) - 943 881 204"
                style={{
                  width: '100%',
                  background: '#121A20',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  outline: 'none',
                  marginTop: '3px'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
              <Check size={16} />
              <span>Guardar datos y Continuar</span>
            </button>
          </form>
        )}
      </div>

      {/* Bottom CTA Actions */}
      {!showRegisterForm && (
        <div>
          <button
            className="btn-primary"
            onClick={() => {
              sound.tap();
              setPassengerStep(2);
            }}
          >
            <span>Crear cuenta / Continuar</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: '#64748B' }}>
            Registrado como <strong style={{ color: '#00E599' }}>{userProfile.fullName.split(' ')[0]}</strong> • Chimbote
          </div>
        </div>
      )}
    </div>
  );
};
