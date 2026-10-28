import React from 'react';
import { Wifi, BatteryMedium, Signal, Car, Navigation } from 'lucide-react';
import { useTransport, TRIP_STATUS } from '../../context/TransportContext';
import { DriverVerification } from './DriverVerification';
import { DriverDashboard } from './DriverDashboard';
import { DriverRequestAlert } from './DriverRequestAlert';
import { DriverPickupNavigation } from './DriverPickupNavigation';
import { DriverTripActive } from './DriverTripActive';
import { DriverEarnings } from './DriverEarnings';

export const DriverPhone = () => {
  const { driverStep, tripStatus, driverIsActive, tripData, activeDriver } = useTransport();

  const renderScreen = () => {
    switch (driverStep) {
      case 1:
        return <DriverVerification />;
      case 2:
        return <DriverDashboard />;
      case 3:
        return <DriverRequestAlert />;
      case 4:
        return <DriverPickupNavigation />;
      case 5:
        return <DriverTripActive />;
      case 6:
        return <DriverEarnings />;
      default:
        return <DriverDashboard />;
    }
  };

  const renderIslandContent = () => {
    if (tripStatus === TRIP_STATUS.REQUESTING) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#38BDF8', fontWeight: 700 }}>
          <span className="radar-sweep" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8' }} />
          <span>¡Nueva Solicitud!</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.DRIVER_ACCEPTED) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#FFFFFF' }}>
          <Navigation size={11} color="#38BDF8" />
          <span>A recogida • {activeDriver.etaMin} min</span>
        </div>
      );
    }
    if (tripStatus === TRIP_STATUS.IN_PROGRESS) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: '#00E599' }}>
          <Car size={11} />
          <span>En curso • {tripData.destination.split(',')[0]}</span>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.62rem', color: driverIsActive ? '#00E599' : '#94A3B8' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: driverIsActive ? '#00E599' : '#64748B' }} />
        <span>{driverIsActive ? 'Lumina Activo' : 'Pausado'}</span>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="phone-label-badge driver-badge">
        <Car size={12} color="#38BDF8" />
        <span>App Conductoras/es • Lumina Driver</span>
      </div>

      <div className="phone-mockup">
        {/* Dynamic Island Notch */}
        <div
          className="status-notch"
          style={{
            width: tripStatus !== TRIP_STATUS.IDLE ? '170px' : '120px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            padding: '0 8px',
            border: tripStatus !== TRIP_STATUS.IDLE ? '1px solid rgba(56, 189, 248, 0.3)' : 'none'
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
        <div className="phone-screen-content page-enter" key={driverStep}>
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
