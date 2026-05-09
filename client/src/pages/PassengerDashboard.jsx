import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import * as api from '../api';
import RideHistory from './RideHistory';

export default function PassengerDashboard({ user, onLogout }) {
  const [view, setView] = useState('ride');
  const [phase, setPhase] = useState('idle');
  const [rideData, setRideData] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [locations, setLocations] = useState({
    pickup: { label: '', lat: 9.0249, lng: 38.7469 },
    dest: { label: '', lat: 9.0356, lng: 38.7523 }
  });

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markers = useRef({ pickup: null, dest: null, driver: null });

  const { subscribe } = useWebSocket();

  // Initialize Leaflet Map
  useEffect(() => {
    if (view === 'ride' && mapRef.current && window.L && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([locations.pickup.lat, locations.pickup.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);
    }
  }, [view]);

  const updateMarker = (type, loc) => {
    if (!leafletMap.current || !window.L) return;
    
    if (markers.current[type]) {
      markers.current[type].setLatLng([loc.lat, loc.lng]);
    } else {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${type === 'driver' ? '#10b981' : (type === 'pickup' ? '#3b82f6' : '#ef4444')}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      markers.current[type] = L.marker([loc.lat, loc.lng], { icon }).addTo(leafletMap.current);
    }

    // Auto-bounds
    const activeMarkers = Object.values(markers.current).filter(m => m);
    if (activeMarkers.length > 1) {
      const group = L.featureGroup(activeMarkers);
      leafletMap.current.fitBounds(group.getBounds().pad(0.2));
    }
  };

  useEffect(() => {
    const unsubAssign = subscribe('DRIVER_ASSIGNED', (data) => {
      setDriverInfo(data.driver);
      setPhase('accepted');
      if (data.driver.currentLat) {
        updateMarker('driver', { lat: data.driver.currentLat, lng: data.driver.currentLng });
      }
    });
    const unsubLoc = subscribe('LOCATION_UPDATE', (pos) => {
      updateMarker('driver', pos);
    });
    const unsubStart = subscribe('RIDE_STARTED', () => setPhase('inProgress'));
    const unsubComplete = subscribe('RIDE_COMPLETED', (data) => {
      setRideData(prev => ({ ...prev, fare: data.fare }));
      setPhase('completed');
    });
    const unsubCancel = subscribe('RIDE_CANCELLED', (data) => {
      alert(data.reason || 'Ride was cancelled');
      setPhase('idle');
      if (markers.current.driver) {
        markers.current.driver.remove();
        markers.current.driver = null;
      }
    });

    return () => {
      unsubAssign(); unsubLoc(); unsubStart(); unsubComplete(); unsubCancel();
    };
  }, [subscribe]);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        pickupLabel: locations.pickup.label,
        destLabel: locations.dest.label,
        pickupLat: locations.pickup.lat, pickupLng: locations.pickup.lng,
        destLat: locations.dest.lat, destLng: locations.dest.lng
      };
      const ride = await api.requestRide(payload);
      setRideData(ride);
      setPhase('searching');
      updateMarker('pickup', locations.pickup);
      updateMarker('dest', locations.dest);
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="dashboard-container">
      <div className="side-panel">
        <header>
          <div>
            <h2 style={{ margin: 0 }}>Hello, {user.name.split(' ')[0]}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Where to today?</p>
          </div>
          <button onClick={onLogout} className="secondary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </header>

        <nav style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setView('ride')} className={view === 'ride' ? '' : 'secondary'} style={{ flex: 1 }}>Request</button>
          <button onClick={() => setView('history')} className={view === 'history' ? '' : 'secondary'} style={{ flex: 1 }}>History</button>
        </nav>

        {view === 'history' ? <RideHistory /> : (
          <div className="card">
            {phase === 'idle' && (
              <form onSubmit={handleRequest}>
                <div className="form-group">
                  <label>Pickup Location</label>
                  <input 
                    type="text" placeholder="Enter pickup address..." required 
                    value={locations.pickup.label}
                    onChange={e => setLocations({ ...locations, pickup: { ...locations.pickup, label: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <input 
                    type="text" placeholder="Where to?" required 
                    value={locations.dest.label}
                    onChange={e => setLocations({ ...locations, dest: { ...locations.dest, label: e.target.value } })}
                  />
                </div>
                <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>Confirm Ride</button>
              </form>
            )}

            {phase === 'searching' && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                <h3>Finding your driver...</h3>
                <button onClick={() => setPhase('idle')} className="danger" style={{ width: '100%', marginTop: '1rem' }}>Cancel</button>
              </div>
            )}

            {(phase === 'accepted' || phase === 'inProgress') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚗</div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{driverInfo?.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>{driverInfo?.vehicleModel} • {driverInfo?.vehiclePlate}</p>
                  </div>
                </div>
                <div className="badge badge-accepted" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
                  {phase === 'accepted' ? 'Driver is coming' : 'Ride in Progress'}
                </div>
                {phase === 'accepted' && <button onClick={() => setPhase('idle')} className="danger" style={{ width: '100%' }}>Cancel Ride</button>}
              </div>
            )}

            {phase === 'completed' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2>Ride Completed</h2>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Total Fare</p>
                  <h1 style={{ margin: 0, color: 'var(--primary)', fontSize: '2.5rem' }}>{rideData?.fare?.toFixed(2)} <small style={{ fontSize: '1rem' }}>ETB</small></h1>
                </div>
                <button onClick={() => setPhase('idle')} style={{ width: '100%' }}>Book Another Ride</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="map-panel">
        <div ref={mapRef} className="map-container" style={{ height: 'calc(100vh - 40px)', position: 'sticky', top: '20px' }}></div>
      </div>
    </div>
  );
}
