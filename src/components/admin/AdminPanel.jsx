import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Activity,
  BadgeCheck,
  Ban,
  CircleDollarSign,
  Radio,
  ShieldAlert,
  Smartphone,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { isWalletBlocked, formatSoles } from '../../utils/transportValidators';

const TABS = [
  { key: 'map', label: 'Mapa en vivo', icon: MapPin },
  { key: 'kyc', label: 'KYC', icon: BadgeCheck },
  { key: 'sos', label: 'Centro SOS', icon: ShieldAlert },
  { key: 'finance', label: 'Finanzas', icon: CircleDollarSign },
  { key: 'events', label: 'API / WebSocket', icon: Activity }
];

const IN_TRIP_STATUSES = [
  TRIP_STATUS.DRIVER_ACCEPTED,
  TRIP_STATUS.DRIVER_ARRIVED,
  TRIP_STATUS.IN_PROGRESS
];

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-color)',
  borderRadius: '14px',
  padding: '14px'
};

const labelStyle = { fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 };

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  padding: '9px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  fontSize: '0.78rem'
};

const Kpi = ({ value, caption, color = '#E2E8F0' }) => (
  <div style={cardStyle}>
    <div style={{ ...labelStyle }}>{caption}</div>
    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color, marginTop: '4px' }}>
      {value}
    </div>
  </div>
);

export const AdminPanel = () => {
  const {
    driverPool,
    activeDriver,
    tripStatus,
    tripData,
    sosActive,
    sosEvents,
    dismissSos,
    tripHistory,
    walletBalance,
    walletStatus,
    apiLog,
    businessRules,
    setDriverVerification,
    settleDriverDebt
  } = useTransport();

  const [tab, setTab] = useState('map');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Mapa en vivo: verde = libre, azul = en viaje, ámbar = KYC pendiente, rojo = SOS
  useEffect(() => {
    if (tab !== 'map' || !mapRef.current) return undefined;

    const map = L.map(mapRef.current, { center: [-9.1060, -78.5510], zoom: 13, zoomControl: false });
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [tab]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    driverPool.forEach((d) => {
      const inTrip = IN_TRIP_STATUSES.includes(tripStatus) && activeDriver?.id === d.id;
      const color = d.verificationStatus === 'APPROVED' ? (inTrip ? '#38BDF8' : '#00E599') : '#FCD34D';

      L.circleMarker(d.coords, {
        radius: inTrip ? 9 : 7,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.85
      })
        .bindTooltip(`${d.name} • ${d.plate} • ${d.distanceKm} km`)
        .addTo(layer);
    });

    if (sosActive && sosEvents[0]?.coords) {
      L.circleMarker(sosEvents[0].coords, { radius: 13, color: '#FF3B5C', weight: 3, fillColor: '#FF3B5C', fillOpacity: 0.4 }).addTo(layer);
    }

    if (IN_TRIP_STATUSES.includes(tripStatus)) {
      L.polyline([tripData.originCoords, tripData.destinationCoords], { color: '#38BDF8', weight: 3, opacity: 0.7, dashArray: '6 8' }).addTo(layer);
    }
  }, [driverPool, tripStatus, activeDriver, sosActive, sosEvents, tripData.originCoords, tripData.destinationCoords]);

  const approved = driverPool.filter((d) => d.verificationStatus === 'APPROVED');
  const pending = driverPool.filter((d) => d.verificationStatus !== 'APPROVED');
  const debts = driverPool.reduce(
    (acc, d) => acc + Math.abs(d.id === 'camila' ? walletBalance : d.walletBalance || 0),
    0
  );
  const latestAlert = sosEvents[0];

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1180px',
        background: 'linear-gradient(180deg, #0B1115 0%, #070B0E 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '22px',
        padding: '18px 20px',
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={16} color="#FF3B5C" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
              Panel Administrativo Lumina
            </h2>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Centro de operaciones de Chimbote y Nuevo Chimbote • doc 7.2 (Backoffice React)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#070B0E', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: active ? '#FF3B5C' : 'transparent',
                  color: active ? '#070B0E' : '#94A3B8',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '5px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Icon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
        <Kpi value={`${approved.length}/${driverPool.length}`} caption="Conductoras/es verificadas" color="#00E599" />
        <Kpi value={pending.length} caption="KYC pendientes" color="#FCD34D" />
        <Kpi value={formatSoles(-Math.abs(debts))} caption="Deudas por efectivo" color={debts > 0 ? '#FF3B5C' : '#E2E8F0'} />
        <Kpi value={sosEvents.length} caption="Alertas SOS de la sesión" color={sosEvents.length ? '#FF3B5C' : '#E2E8F0'} />
        <Kpi value={tripHistory.length} caption="Viajes registrados" color="#38BDF8" />
        <Kpi value={tripStatus} caption="Estado del ciclo" color="#E2E8F0" />
      </div>

      {tab === 'map' && (
        <div style={{ ...cardStyle, padding: '10px' }}>
          <div ref={mapRef} style={{ height: '340px', borderRadius: '10px', overflow: 'hidden', background: '#0A0F13' }} />
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px', fontSize: '0.7rem', color: '#94A3B8' }}>
            <span><span style={{ color: '#00E599' }}>●</span> Libre (disponible para matching)</span>
            <span><span style={{ color: '#38BDF8' }}>●</span> En viaje activo</span>
            <span><span style={{ color: '#FCD34D' }}>●</span> KYC pendiente o rechazado</span>
            <span><span style={{ color: '#FF3B5C' }}>●</span> Alerta SOS en curso</span>
          </div>
        </div>
      )}

      {tab === 'kyc' && (
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '6px' }}>Aprobación de DNI, licencia, SOAT y biometría (verification_status)</div>
          {driverPool.map((d) => (
            <div key={d.id} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.verificationStatus === 'APPROVED' ? '#00E599' : '#FCD34D', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{d.name} <span style={{ color: '#64748B', fontWeight: 600 }}>• {d.plate}</span></div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    Lic. {d.licenseNumber} • SOAT vence {d.soatExpiration} • categoría {d.category}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', color: d.verificationStatus === 'APPROVED' ? '#00E599' : '#FCD34D', fontWeight: 700 }}>
                  {d.verificationStatus}
                </span>
                {d.verificationStatus !== 'APPROVED' && (
                  <button className="btn-secondary" style={{ padding: '4px 9px', fontSize: '0.68rem' }} onClick={() => setDriverVerification(d.id, 'APPROVED')}>
                    Aprobar
                  </button>
                )}
                {d.verificationStatus !== 'REJECTED' && (
                  <button
                    onClick={() => setDriverVerification(d.id, 'REJECTED')}
                    style={{ background: 'transparent', border: '1px solid rgba(255, 59, 92, 0.4)', color: '#FF3B5C', borderRadius: '8px', padding: '4px 9px', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Ban size={12} />
                    Rechazar
                  </button>
                )}
              </div>
            </div>
          ))}
          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '10px' }}>
            Solo las cuentas APPROVED entran al algoritmo de matching (radio de {businessRules.MATCHING_RADIUS_KM} km).
          </div>
        </div>
      )}

      {tab === 'sos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sosActive && (
            <div style={{ background: 'rgba(255, 59, 92, 0.12)', border: '1.5px solid #FF3B5C', borderRadius: '14px', padding: '14px', boxShadow: '0 0 30px rgba(255, 59, 92, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#FF3B5C' }}>
                <ShieldAlert size={18} />
                <span>ALERTA ACTIVA EN MAPA</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#FECDD3', marginTop: '6px' }}>
                {latestAlert?.driver} • placa {latestAlert?.plate || tripData.plate} • {latestAlert?.coords?.join(', ')}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <a href="tel:105" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', background: '#FF3B5C', color: '#FFFFFF', fontWeight: 700, fontSize: '0.78rem', padding: '8px 12px', borderRadius: '10px' }}>
                  <PhoneCall size={14} />
                  Llamar PNP 105
                </a>
                <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.78rem' }} onClick={dismissSos}>
                  Cerrar alerta
                </button>
              </div>
            </div>
          )}

          <div style={cardStyle}>
            <div style={{ ...labelStyle, marginBottom: '6px' }}>Escucha del evento sos_triggered (Socket.io)</div>
            {sosEvents.length === 0 && <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Sin alertas en esta sesión.</div>}
            {sosEvents.map((e) => (
              <div key={e.id} style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={13} color="#FF3B5C" />
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{e.driver} • {e.plate}</span>
                  <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>{e.destination?.split(',')[0]}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748B' }}>{e.at}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'finance' && (
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '6px' }}>Billeteras y deuda por viajes cobrados en efectivo (límite −{formatSoles(businessRules.CASH_DEBT_LIMIT)})</div>
          <div style={rowStyle}>
            <div>
              <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Camila Torres <span style={{ color: '#64748B', fontWeight: 600 }}>• sesión activa</span></div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>wallet_balance de la tabla drivers (doc 4.2)</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: walletStatus.debt > 0 ? '#FF3B5C' : '#00E599', fontWeight: 700 }}>{formatSoles(walletBalance)}</span>
              {walletStatus.debt > 0 && (
                <button className="btn-secondary" style={{ padding: '4px 9px', fontSize: '0.68rem' }} onClick={() => settleDriverDebt('camila')}>
                  Cobrar Yape/Plin
                </button>
              )}
            </div>
          </div>
          {driverPool.filter((d) => d.id !== 'camila').map((d) => {
            const balance = d.walletBalance || 0;
            return (
              <div key={d.id} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{d.name} <span style={{ color: '#64748B', fontWeight: 600 }}>• {d.plate}</span></div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                    {d.tripsCount} viajes • aceptación {d.acceptanceRate}% {isWalletBlocked(balance) ? '• bloqueada por deuda' : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: balance < 0 ? '#FF3B5C' : '#00E599', fontWeight: 700 }}>{formatSoles(balance)}</span>
                  {balance < 0 && (
                    <button className="btn-secondary" style={{ padding: '4px 9px', fontSize: '0.68rem' }} onClick={() => settleDriverDebt(d.id)}>
                      Cobrar Yape/Plin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'events' && (
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '6px' }}>Endpoints (doc 6.1) y eventos en tiempo real (doc 6.2)</div>
          {apiLog.length === 0 && <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Aún sin tráfico: solicita un viaje desde el teléfono del pasajero.</div>}
          {apiLog.map((entry) => (
            <div key={entry.id} style={rowStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '5px', background: entry.kind === 'REST' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 229, 153, 0.15)', color: entry.kind === 'REST' ? '#38BDF8' : '#00E599' }}>
                  {entry.kind}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#FFFFFF' }}>{entry.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{entry.detail}</div>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#64748B', flexShrink: 0 }}>{entry.at}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
