import React, { useEffect, useRef } from 'react';
import { Navigation } from 'lucide-react';
import { useTransport } from '../../context/TransportContext';

export const InteractiveMap = ({
  progress = 0,
  showVehicle = true,
  height = '180px',
  statusBadge = 'En ruta • Chimbote'
}) => {
  const canvasRef = useRef(null);
  const { tripData } = useTransport();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Coordenadas del trayecto vial limpio: Nuevo Chimbote -> Chimbote
    // Sigue la curva de la Carretera Panamericana Norte
    const pA = { x: 55, y: height - 42 }; // Origen A: Plaza Nuevo Chimbote
    const pC1 = { x: 120, y: height - 70 }; // Waypoint Av. Pacífico
    const pC2 = { x: 185, y: 75 };          // Waypoint Panamericana Norte
    const pB = { x: width - 52, y: 38 };    // Destino B: Megaplaza Chimbote

    // Función suave para obtener la posición exacta a lo largo de la curva Bézier
    const getPointOnPath = (t) => {
      const clampedT = Math.max(0, Math.min(1, t));
      const u = 1 - clampedT;
      const tt = clampedT * clampedT;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * clampedT;

      const x = uuu * pA.x + 3 * uu * clampedT * pC1.x + 3 * u * tt * pC2.x + ttt * pB.x;
      const y = uuu * pA.y + 3 * uu * clampedT * pC1.y + 3 * u * tt * pC2.y + ttt * pB.y;

      return { x, y };
    };

    let animationFrame;
    let pulseAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Fondo de mapa limpio estilo Google Maps Dark
      ctx.fillStyle = '#080C0F';
      ctx.fillRect(0, 0, width, height);

      // Calles secundarias simplificadas y discretas
      ctx.strokeStyle = '#121920';
      ctx.lineWidth = 1;
      for (let x = 30; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 30; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Carretera base gris oscura (Vía Panamericana Norte / Av. Pacífico)
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.bezierCurveTo(pC1.x, pC1.y, pC2.x, pC2.y, pB.x, pB.y);
      ctx.strokeStyle = '#1A242D';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 2. Ruta activa en verde esmeralda limpio
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.bezierCurveTo(pC1.x, pC1.y, pC2.x, pC2.y, pB.x, pB.y);
      ctx.strokeStyle = '#00E599';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 3. Marcador de Origen A (Nuevo Chimbote)
      ctx.beginPath();
      ctx.arc(pA.x, pA.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00E599';
      ctx.fill();
      ctx.strokeStyle = '#080C0F';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#080C0F';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', pA.x, pA.y);

      // 4. Marcador de Destino B (Megaplaza Chimbote)
      ctx.beginPath();
      ctx.arc(pB.x, pB.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#00E599';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#080C0F';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('B', pB.x, pB.y);

      // 5. PUNTO DE COLOR SIMPLIFICADO QUE SE ACERCA AL DESTINO (Minimalista y limpio)
      if (showVehicle) {
        pulseAngle += 0.05;
        const normT = Math.max(0.01, Math.min(0.99, progress / 100));
        const currentPos = getPointOnPath(normT);

        // Anillo sutil de pulsación exterior
        const ringPulse = 11 + Math.sin(pulseAngle) * 3;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, ringPulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 153, 0.2)';
        ctx.fill();

        // Punto de color central nítido
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00E599';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrame);
  }, [progress, showVehicle]);

  // Distancia restante calculada de acuerdo al avance
  const remainingKm = Math.max(0.1, Number((tripData.distanceKm * (1 - progress / 100)).toFixed(1)));

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#080C0F'
      }}
    >
      <canvas
        ref={canvasRef}
        width={340}
        height={parseInt(height, 10) || 180}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {/* Badge superior de estado */}
      {statusBadge && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(8, 12, 15, 0.9)',
            border: '1px solid rgba(0, 229, 153, 0.4)',
            borderRadius: '99px',
            padding: '3px 9px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.68rem',
            color: '#00E599',
            fontWeight: 700
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00E599' }} />
          {statusBadge}
        </div>
      )}

      {/* Indicador inferior simplificado de distancia restante al punto de llegada */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(8, 12, 15, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.68rem',
          color: '#E2E8F0',
          fontWeight: 600
        }}
      >
        <Navigation size={12} color="#00E599" />
        <span>
          {progress > 0 && progress < 100
            ? `A ${remainingKm} km del destino (Megaplaza)`
            : 'Av. Pacífico ➔ Panamericana Norte'}
        </span>
      </div>
    </div>
  );
};
