import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ScanFace, Lock, Sparkles, Check, Camera, VideoOff } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';
import { sound } from '../../utils/audioEffects';

export const PassengerVerification = () => {
  const { setPassengerStep, biometricsDone, setBiometricsDone } = useTransport();
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(biometricsDone);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    if (useRealCamera) {
      navigator.mediaDevices?.getUserMedia({ video: { width: 320, height: 240 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setCameraError(true);
          setUseRealCamera(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useRealCamera]);

  const startScan = () => {
    sound.tap();
    setScanning(true);

    const pulseInterval = setInterval(() => {
      sound.scanPulse();
    }, 450);

    setTimeout(() => {
      clearInterval(pulseInterval);
      sound.success();
      setScanning(false);
      setScanSuccess(true);
      setBiometricsDone(true);
    }, 2200);
  };

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="screen-back-btn" onClick={() => setPassengerStep(1)}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
              Verifica tu identidad
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8' }}>2 DE 8</span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.45, marginBottom: '16px' }}>
          Tres pasos sencillos para protegerte a ti y a cada persona de la comunidad.
        </p>

        {/* Steps Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div className="card-glass" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0, 229, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#00E599" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>Documento de identidad</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LISTO</span>
          </div>

          <div className="card-glass" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0, 229, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#00E599" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>Selfie reciente</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00E599', background: 'rgba(0, 229, 153, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LISTO</span>
          </div>

          <div
            className="card-glass"
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: scanSuccess ? '1px solid #00E599' : '1px solid rgba(245, 158, 11, 0.4)',
              background: scanSuccess ? 'rgba(0, 229, 153, 0.05)' : 'var(--bg-surface-elevated)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: scanSuccess ? 'rgba(0, 229, 153, 0.2)' : 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {scanSuccess ? <Check size={13} color="#00E599" strokeWidth={3} /> : <ScanFace size={13} color="#F59E0B" />}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>Prueba de vida</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: scanSuccess ? '#00E599' : '#F59E0B', background: scanSuccess ? 'rgba(0, 229, 153, 0.1)' : 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
              {scanSuccess ? 'LISTO' : 'AHORA'}
            </span>
          </div>
        </div>

        {/* Biometric Interactive Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            background: '#070C0F',
            border: scanSuccess ? '2px solid #00E599' : '2px dashed rgba(0, 229, 153, 0.35)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: scanning ? '0 0 35px rgba(0, 229, 153, 0.4)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Real camera video background if enabled */}
          {useRealCamera && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.1) brightness(0.9)',
                transform: 'scaleX(-1)'
              }}
            />
          )}

          {/* Laser scanning beam */}
          {scanning && (
            <div
              className="scan-beam"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #00E599, transparent)',
                boxShadow: '0 0 16px #00E599',
                zIndex: 10
              }}
            />
          )}

          {/* Biometric Reticle */}
          <div
            style={{
              position: 'relative',
              width: '90px',
              height: '105px',
              border: `2px ${scanSuccess ? 'solid #00E599' : 'dashed rgba(0, 229, 153, 0.5)'}`,
              borderRadius: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              background: useRealCamera ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
            }}
          >
            {scanSuccess ? (
              <CheckCircle2 size={46} color="#00E599" />
            ) : (
              <ScanFace size={46} color={scanning ? '#00E599' : '#94A3B8'} />
            )}
          </div>

          {/* Status Text & Confidence Badge */}
          <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: scanSuccess ? '#00E599' : '#CBD5E1', zIndex: 5, textAlign: 'center' }}>
            {scanning ? 'Validando prueba de vida 3D...' : scanSuccess ? '¡Identidad verificada (Cotejo 99.4%)!' : 'Centra tu rostro en el marco'}
          </div>

          {/* Camera toggle pill */}
          <button
            onClick={() => setUseRealCamera(!useRealCamera)}
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(10, 16, 20, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '99px',
              color: '#94A3B8',
              fontSize: '0.62rem',
              fontWeight: 600,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              zIndex: 12
            }}
          >
            <Camera size={11} color="#00E599" />
            <span>{useRealCamera ? 'Modo silueta' : 'Usar mi cámara'}</span>
          </button>
        </div>

        {/* Security Disclosure */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px' }}>
          <Lock size={13} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.4 }}>
            Tus datos biométricos se cifran en tu dispositivo con hash seguro SHA-256. Nunca se comparten con conductores.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ marginTop: '14px' }}>
        {!scanSuccess ? (
          <button className="btn-primary" onClick={startScan} disabled={scanning}>
            <Sparkles size={18} />
            <span>{scanning ? 'Autenticando...' : 'Iniciar prueba de vida'}</span>
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setPassengerStep(3)}>
            <span>Continuar</span>
            <Check size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
