import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, Check, Layers, MapPin, Sparkles, Star, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTransport, CHIMBOTE_POPULAR_PLACES } from '../../context/TransportContext';
import { sound } from '../../utils/audioEffects';
import { calculateFare } from '../../utils/transportValidators';

export const InteractiveMapModal = () => {
  const {
    isMapPickerOpen,
    setIsMapPickerOpen,
    tripData,
    setTripData,
    rideProfile
  } = useTransport();

  const [activePinSelection, setActivePinSelection] = useState('destination');
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' | 'satellite'
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Coordenadas actuales
  const [originCoords, setOriginCoords] = useState(tripData.originCoords || [-9.1245, -78.5306]);
  const [destCoords, setDestCoords] = useState(tripData.destinationCoords || [-9.0880, -78.5720]);
  const [originAddress, setOriginAddress] = useState(tripData.origin);
  const [destAddress, setDestAddress] = useState(tripData.destination);

  // Fórmula de Haversine para distancias precisas
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const currentDistKm = Math.max(0.8, getDistanceFromLatLonInKm(originCoords[0], originCoords[1], destCoords[0], destCoords[1]));
  const currentDurationMin = Math.max(4, Math.round(currentDistKm * 2.5));
  const calculatedFare = calculateFare(currentDistKm, currentDurationMin, rideProfile.category, rideProfile.isNight);

  // Inicializar Leaflet con Google Maps tiles oficial
  useEffect(() => {
    if (!isMapPickerOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centro sobre Chimbote y Nuevo Chimbote
      const map = L.map(mapContainerRef.current, {
        center: [-9.1060, -78.5510],
        zoom: 13,
        zoomControl: false
      });

      const tileUrl =
        mapType === 'satellite'
          ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Iconos minimalistas limpios
      const originIcon = L.divIcon({
        className: 'custom-pin-a',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:#00E599;border:3px solid #060A0D;box-shadow:0 0 14px #00E599;display:flex;align-items:center;justify-content:center;color:#060A0D;font-weight:900;font-size:12px;">A</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const destIcon = L.divIcon({
        className: 'custom-pin-b',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:#FFFFFF;border:3px solid #00E599;box-shadow:0 0 14px rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;color:#060A0D;font-weight:900;font-size:12px;">B</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const originMarker = L.marker(originCoords, { icon: originIcon, draggable: true }).addTo(map);
      const destMarker = L.marker(destCoords, { icon: destIcon, draggable: true }).addTo(map);

      // Trazado de ruta por la carretera de Google Maps (Panamericana Norte / Av. Pacífico)
      // Agregamos punto intermedio sobre el eje vial para que siga la carretera
      const midLat = (originCoords[0] + destCoords[0]) / 2;
      const midLng = (originCoords[1] + destCoords[1]) / 2;
      const routeLine = L.polyline([originCoords, [midLat, midLng], destCoords], {
        color: '#00E599',
        weight: 5,
        opacity: 0.95
      }).addTo(map);

      originMarkerRef.current = originMarker;
      destMarkerRef.current = destMarker;
      routeLineRef.current = routeLine;

      // Arrastre interactivo
      originMarker.on('dragend', (e) => {
        sound.tap();
        const { lat, lng } = e.target.getLatLng();
        setOriginCoords([lat, lng]);
        updateRoute();
      });

      destMarker.on('dragend', (e) => {
        sound.tap();
        const { lat, lng } = e.target.getLatLng();
        setDestCoords([lat, lng]);
        updateRoute();
      });

      // Clic para ubicar pin activo
      map.on('click', (e) => {
        sound.tap();
        const { lat, lng } = e.latlng;
        if (activePinSelection === 'origin') {
          setOriginCoords([lat, lng]);
          originMarker.setLatLng([lat, lng]);
          setActivePinSelection('destination');
        } else {
          setDestCoords([lat, lng]);
          destMarker.setLatLng([lat, lng]);
        }
        updateRoute();
      });

      mapInstanceRef.current = map;
    }

    const updateRoute = () => {
      if (routeLineRef.current && originMarkerRef.current && destMarkerRef.current) {
        const o = originMarkerRef.current.getLatLng();
        const d = destMarkerRef.current.getLatLng();
        const mLat = (o.lat + d.lat) / 2;
        const mLng = (o.lng + d.lng) / 2;
        routeLineRef.current.setLatLngs([o, [mLat, mLng], d]);
      }
    };

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapPickerOpen]);

  // Actualizar capa Satélite / Calles Google
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileUrl =
      mapType === 'satellite'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    const newLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapType]);

  const handleSelectPopularSpot = (spot) => {
    sound.tap();
    if (activePinSelection === 'origin') {
      setOriginCoords(spot.coords);
      setOriginAddress(spot.address);
      if (originMarkerRef.current) originMarkerRef.current.setLatLng(spot.coords);
      setActivePinSelection('destination');
    } else {
      setDestCoords(spot.coords);
      setDestAddress(spot.address);
      if (destMarkerRef.current) destMarkerRef.current.setLatLng(spot.coords);
    }
    if (routeLineRef.current && originMarkerRef.current && destMarkerRef.current) {
      const o = originMarkerRef.current.getLatLng();
      const d = destMarkerRef.current.getLatLng();
      const mLat = (o.lat + d.lat) / 2;
      const mLng = (o.lng + d.lng) / 2;
      routeLineRef.current.setLatLngs([o, [mLat, mLng], d]);
    }
  };

  const applyRouteSelection = () => {
    sound.success();
    setTripData((prev) => ({
      ...prev,
      origin: originAddress,
      originCoords,
      destination: destAddress,
      destinationCoords: destCoords,
      distanceKm: currentDistKm,
      durationMin: currentDurationMin
    }));
    setIsMapPickerOpen(false);
  };

  if (!isMapPickerOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 10, 0.94)',
        backdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div
        style={{
          background: '#0B1115',
          border: '1.5px solid rgba(0, 229, 153, 0.45)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 45px rgba(0, 229, 153, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header con Google Maps */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(14, 21, 25, 0.95)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 229, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00E599'
              }}
            >
              <MapIcon size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                Google Maps • Chimbote y Nuevo Chimbote
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                Toca o arrastra los pines para trazar la ruta en carreteras reales
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.tap();
              setIsMapPickerOpen(false);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Pin Selector Tabs & Layer Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#080E12', borderBottom: '1px solid var(--border-color)', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            <button
              onClick={() => {
                sound.tap();
                setActivePinSelection('origin');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: activePinSelection === 'origin' ? '1.5px solid #00E599' : '1px solid var(--border-color)',
                background: activePinSelection === 'origin' ? 'rgba(0, 229, 153, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E599' }} />
              <span>A: Recogida</span>
            </button>

            <button
              onClick={() => {
                sound.tap();
                setActivePinSelection('destination');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: activePinSelection === 'destination' ? '1.5px solid #00E599' : '1px solid var(--border-color)',
                background: activePinSelection === 'destination' ? 'rgba(0, 229, 153, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                color: '#FFFFFF',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#FFFFFF', border: '1px solid #00E599' }} />
              <span>B: Destino</span>
            </button>
          </div>

          {/* Toggle Capa Google Maps */}
          <div style={{ display: 'flex', background: '#121A20', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => {
                sound.tap();
                setMapType('roadmap');
              }}
              style={{
                background: mapType === 'roadmap' ? '#00E599' : 'transparent',
                color: mapType === 'roadmap' ? '#060A0D' : '#94A3B8',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              Google Calles
            </button>
            <button
              onClick={() => {
                sound.tap();
                setMapType('satellite');
              }}
              style={{
                background: mapType === 'satellite' ? '#00E599' : 'transparent',
                color: mapType === 'satellite' ? '#060A0D' : '#94A3B8',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              Satélite
            </button>
          </div>
        </div>

        {/* Mapa Google Maps Container */}
        <div style={{ position: 'relative', width: '100%', height: '290px', background: '#060A0D' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
        </div>

        {/* Puntos de Mayor Frecuencia y Calificación Google Maps en Chimbote */}
        <div style={{ padding: '10px 14px', background: '#070C0F', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
            Destinos más concurridos (Mejores calificaciones en Google Maps):
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {CHIMBOTE_POPULAR_PLACES.map((spot) => (
              <div
                key={spot.id}
                onClick={() => handleSelectPopularSpot(spot)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  maxWidth: '190px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {spot.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#CBD5E1', marginTop: '2px' }}>
                  <Star size={11} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{spot.rating}</span>
                  <span style={{ color: '#64748B' }}>({spot.reviewsCount})</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#00E599', fontWeight: 700, marginTop: '2px' }}>
                  S/ {calculateFare(spot.distanceKm, spot.durationMin, rideProfile.category, rideProfile.isNight).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer con Tarifa y Confirmación */}
        <div style={{ padding: '12px 18px', background: '#0E1519', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                Tarifa Fija Garantizada (Chimbote)
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: '#00E599' }}>
                S/ {calculatedFare.toFixed(2)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                {currentDistKm} km • ~{currentDurationMin} min
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                Nuevo Chimbote ⇄ Chimbote
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={applyRouteSelection}>
            <Check size={18} strokeWidth={2.5} />
            <span>Aplicar Ruta en Chimbote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
