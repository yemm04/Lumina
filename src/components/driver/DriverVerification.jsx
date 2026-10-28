import React from 'react';
import { ArrowLeft, ShieldCheck, Check, Car, Sparkles, FileCheck, CheckCircle2 } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';

export const DriverVerification = () => {
  const { setDriverStep } = useTransport();

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              Conduce con respaldo
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>1 DE 6</span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.45, marginBottom: '18px' }}>
          Verificamos a todas las partes con el mismo estándar. Tu información se mantiene protegida.
        </p>

        {/* Profile mini header */}
        <div className="card-glass" style={{ padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1E293B',
                border: '1.5px solid #38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#38BDF8'
              }}
            >
              CT
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>Camila Torres</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>4.93 ★ • 72% aprobación</div>
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
            En revisión
          </span>
        </div>

        {/* Requirements Checklist Peru */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* Doc */}
          <div className="card-glass" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>DNI y Licencia MTC</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Clase A-IIa profesional vigente (RENIEC / MTC)</div>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LISTO</span>
          </div>

          {/* Background checks */}
          <div className="card-glass" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>Antecedentes Penales y Policiales</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Poder Judicial y PNP Perú sin observaciones</div>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LISTO</span>
          </div>

          {/* Biometrics */}
          <div className="card-glass" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>Biometría Facial RENIEC</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Rostro y prueba de vida 3D validados</div>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LISTO</span>
          </div>

          {/* Vehicle Review */}
          <div className="card-glass" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #38BDF8' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>SOAT + Revisión Técnica (CITV)</div>
              <div style={{ fontSize: '0.68rem', color: '#38BDF8' }}>Póliza vigente y placa peruana BCF-524</div>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>AHORA</span>
          </div>
        </div>

        {/* Remote Inspection Summary */}
        <div className="card-glass" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Car size={22} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>
            <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>Inspección remota</div>
            <div>✔ Exterior e interior &nbsp; ✔ Cinturones y luces</div>
          </div>
        </div>
      </div>

      {/* Button */}
      <div style={{ marginTop: '16px' }}>
        <button
          className="btn-primary"
          style={{ background: '#38BDF8', color: '#070B0E' }}
          onClick={() => setDriverStep(2)}
        >
          <Sparkles size={16} />
          <span>Completar revisión y activar</span>
        </button>
      </div>
    </div>
  );
};
