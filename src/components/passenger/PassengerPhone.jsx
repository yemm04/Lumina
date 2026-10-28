import React, { useState } from 'react';
import { Wifi, BatteryMedium, Signal, Shield, Car, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { PassengerWelcome } from './PassengerWelcome';
import { PassengerVerification } from './PassengerVerification';
import { PassengerRideType } from './PassengerRideType';
import { PassengerRouteConfig } from './PassengerRouteConfig';
import { PassengerConfirm } from './PassengerConfirm';
import { PassengerDriverEnRoute } from './PassengerDriverEnRoute';
import { PassengerTripInProgress } from './PassengerTripInProgress';
import { PassengerTripCompleted } from './PassengerTripCompleted';

export const PassengerPhone = () => {
  const { passengerStep, tripStatus, tripProgress, tripData, activeDriver, currentCandidate } = useTransport();
  const [islandExpanded, setIslandExpanded] = useState(false);

  const renderScreen = () => {
    switch (passengerStep) {
      case 1:
        return <PassengerWelcome />;
      case 2:
        return <PassengerVerification />;
      case 3:
        return <PassengerRideType />;
      case 4:
        return <PassengerRouteConfig />;
      case 5:
        return <PassengerConfirm />;
      case 6:
        return <PassengerDriverEnRoute />;
      case 7:
        return <PassengerTripInProgress />;
      case 8:
        return <PassengerTripCompleted />;
      default:
        return <PassengerWelcome />;
    }
  };

  // Live Activity Pill Content
  const renderIslandContent = () => {
    if (tripStatus === TRIP_STATUS.REQUESTING) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#00E599' }}>
          <span className="radar-sweep" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E599' }} />
          <span>Buscando • {currentCandidate ? currentCandidate.name.split(' ')[0] : 'cerca de ti'}</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.NO_DRIVER || tripStatus === TRIP_STATUS.CANCELLED) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#FDA4AF' }}>
          <AlertTriangle size={11} />
          <span>{tripStatus === TRIP_STATUS.NO_DRIVER ? 'Sin conductoras disponibles' : 'Viaje cancelado'}</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.DRIVER_ACCEPTED) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#FFFFFF' }}>
          <Car size={11} color="#00E599" />
          <span>{activeDriver.name.split(' ')[0]} en camino • {activeDriver.etaMin} min</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.DRIVER_ARRIVED) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#00E599', fontWeight: 700 }}>
          <Navigation size={11} />
          <span>¡En el lobby principal!</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.IN_PROGRESS) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#FFFFFF' }}>
          <Navigation size={11} color="#00E599" />
          <span>En ruta • {Math.max(1, Math.round(tripData.durationMin * (1 - tripProgress / 100)))} min</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.COMPLETED) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#00E599' }}>
          <CheckCircle size={11} />
          <span>Viaje seguro completado</span>
        </div>
      );
    }

    return <div className="notch-camera" />;
  };

  const hasActiveActivity = tripStatus !== TRIP_STATUS.IDLE;

  return (
    <div style={{ position: 'relative' }}>
      <div className="phone-label-badge passenger-badge">
        <Shield size={12} color="#00E599" />
        <span>App Pasajeros/as • Lumina</span>
      </div>

      <div className="phone-mockup">
        {/* Dynamic Island / Live Activity Notch */}
        <div
          className="status-notch"
          onClick={() => setIslandExpanded(!islandExpanded)}
          style={{
            width: hasActiveActivity ? '180px' : '110px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: hasActiveActivity ? 'pointer' : 'default',
            padding: '0 8px',
            border: hasActiveActivity ? '1px solid rgba(0, 229, 153, 0.3)' : 'none',
            boxShadow: hasActiveActivity ? '0 0 15px rgba(0, 229, 153, 0.2)' : 'none'
          }}
        >
          {renderIslandContent()}
        </div>

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>11:00</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Signal size={12} />
            <Wifi size={12} />
            <BatteryMedium size={14} />
          </div>
        </div>

        {/* Screen Viewport with Slide Animation */}
        <div className="phone-screen-content page-enter" key={passengerStep}>
          {renderScreen()}
        </div>

        {/* Bottom Home Indicator */}
        <div className="home-indicator-bar">
          <div className="home-pill" />
        </div>
      </div>
    </div>
  );
};
