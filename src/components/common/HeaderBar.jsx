import React, { useState } from 'react';
import { Shield, Smartphone, RotateCcw, Users, AlertTriangle, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { sound } from '../../utils/audioEffects';

export const HeaderBar = () => {
  const {
    viewMode,
    setViewMode,
    userGenderMode,
    setUserGenderMode,
    resetSimulation,
    triggerSos
  } = useTransport();

  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.muted = nextState;
    if (!nextState) {
      sound.tap();
    }
  };

  const toggleFullscreen = () => {
    sound.tap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="workspace-header">
      {/* Brand */}
      <div className="brand-badge">
        <div className="brand-logo-icon">
          <Shield size={20} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-name">Lumina</span>
            <span className="brand-tag">Transporte Seguro</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Movilidad con Respaldo y Monitoreo Activo 24/7
          </div>
        </div>
      </div>

      {/* Selector de Vista: Dual vs Pasajero vs Conductor */}
      <div className="view-mode-tabs">
        <button
          className={`mode-tab-btn ${viewMode === 'dual' ? 'active' : ''}`}
          onClick={() => {
            sound.tap();
            setViewMode('dual');
          }}
          title="Ver ambas aplicaciones en tiempo real sincronizadas"
        >
          <Smartphone size={15} />
          <span>Vista Dual (Demo en Vivo)</span>
        </button>

        <button
          className={`mode-tab-btn passenger ${viewMode === 'passenger' ? 'active' : ''}`}
          onClick={() => {
            sound.tap();
            setViewMode('passenger');
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E599' }} />
          <span>Pasajeros/as</span>
        </button>

        <button
          className={`mode-tab-btn driver ${viewMode === 'driver' ? 'active' : ''}`}
          onClick={() => {
            sound.tap();
            setViewMode('driver');
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} />
          <span>Conductoras/es</span>
        </button>

        <button
          className={`mode-tab-btn admin ${viewMode === 'admin' ? 'active' : ''}`}
          onClick={() => {
            sound.tap();
            setViewMode('admin');
          }}
          title="Centro de operaciones: mapa en vivo, KYC, SOS, finanzas y eventos de la API"
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3B5C' }} />
          <span>Panel Admin</span>
        </button>
      </div>

      {/* Controles de Simulación y Perfil */}
      <div className="quick-sim-actions">
        {/* Toggle de sonido */}
        <button
          className="sim-btn"
          onClick={toggleSound}
          title={isMuted ? 'Activar efectos de sonido' : 'Silenciar efectos'}
        >
          {isMuted ? <VolumeX size={14} color="#FDA4AF" /> : <Volume2 size={14} color="#00E599" />}
          <span>{isMuted ? 'Mudo' : 'Audio FX'}</span>
        </button>

        {/* Toggle para hombres y mujeres */}
        <button
          className="sim-btn"
          onClick={() => {
            sound.tap();
            setUserGenderMode((prev) => (prev === 'universal' ? 'women_priority' : 'universal'));
          }}
          title="Alternar entre modo inclusivo universal y prioridad femenina"
        >
          <Users size={14} color="#00E599" />
          <span>
            {userGenderMode === 'universal' ? 'Modo: Universal (H/M)' : 'Modo: Enfoque Ellas'}
          </span>
        </button>

        {/* Pantalla Completa para Proyector */}
        <button className="sim-btn" onClick={toggleFullscreen} title="Pantalla completa para presentación">
          <Maximize2 size={14} />
          <span>Pantalla Completa</span>
        </button>

        {/* Botón de pánico de prueba */}
        <button
          className="sim-btn"
          style={{ borderColor: 'rgba(255, 59, 92, 0.4)', color: '#FF3B5C' }}
          onClick={() => triggerSos('passenger')}
          title="Simular botón de pánico SOS"
        >
          <AlertTriangle size={14} />
          <span>Test SOS</span>
        </button>

        {/* Reiniciar demo */}
        <button className="sim-btn reset" onClick={resetSimulation} title="Reiniciar todo el flujo interactivo">
          <RotateCcw size={14} />
          <span>Reiniciar</span>
        </button>
      </div>
    </header>
  );
};
