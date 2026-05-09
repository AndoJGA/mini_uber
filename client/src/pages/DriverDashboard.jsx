import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import * as api from '../api';
import RideHistory from './RideHistory';

export default function DriverDashboard({ user, onLogout }) {
  const [view, setView] = useState('dashboard');
  const [phase, setPhase] = useState('available');
  const [requests, setRequests] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markers = useRef({ pickup: null, dest: null });

  const { subscribe } = useWebSocket();

  // Initialize Leaflet Map
  useEffect(() => {
    if (view === 'dashboard' && mapRef.current && window.L && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([9.0249, 38.7469], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current);
    }
  }, [view]);

  useEffect(() => {
    const unsubNew = subscribe('NEW_RIDE_REQUEST', (ride) => {
      setRequests(prev => [...prev, ride]);
    });
    const unsubTaken = subscribe('REQUEST_TAKEN', ({ requestId }) => {
      setRequests(prev => prev.filter(x => (x.request_id || x.requestId) !== requestId));
    });
    const unsubCancel = subscribe('RIDE_CANCELLED', () => {
      alert('Passenger cancelled the ride');
      setPhase('available');
      setCurrentRide(null);
      clearMarkers();
    });

    return () => {
      unsubNew(); unsubTaken(); unsubCancel();
    };
  }, [subscribe]);

  const clearMarkers = () => {
    if (markers.current.pickup) markers.current.pickup.remove();
    if (markers.current.dest) markers.current.dest.remove();
    markers.current = { pickup: null, dest: null };
  };

  const updateMarkers = (ride) => {
    if (!leafletMap.current || !window.L) return;
    clearMarkers();

    const pLat = ride.pickup_lat || ride.pickupLat;
    const pLng = ride.pickup_lng || ride.pickupLng;
    const dLat = ride.dest_lat || ride.destLat;
    const dLng = ride.dest_lng || ride.destLng;

    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold;">P</div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const destIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; font-weight: bold;">D</div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    markers.current.pickup = L.marker([pLat, pLng], { icon: pickupIcon }).addTo(leafletMap.current);
    markers.current.dest = L.marker([dLat, dLng], { icon: destIcon }).addTo(leafletMap.current);

    const group = L.featureGroup([markers.current.pickup, markers.current.dest]);
    leafletMap.current.fitBounds(group.getBounds().pad(0.2));
  };

  const handleAccept = async (requestId) => {
    try {
      const ride = await api.acceptRide(requestId);
      setCurrentRide(ride);
      setPhase('accepted');
      setRequests([]);
      updateMarkers(ride);
    } catch (err) {
      alert(err.message === 'ALREADY_TAKEN' ? 'Ride already taken' : err.message);
      setRequests(prev => prev.filter(x => (x.request_id || x.requestId) !== requestId));
    }
  };

  const handleStart = async () => {
    try {
      await api.startRide(currentRide.request_id || currentRide.requestId);
      setPhase('inProgress');
    } catch (err) { alert(err.message); }
  };

  const handleComplete = async () => {
    try {
      const { fare } = await api.completeRide(currentRide.request_id || currentRide.requestId);
      alert(`Ride completed! Fare: ${fare.toFixed(2)} ETB`);
      setPhase('available');
      setCurrentRide(null);
      clearMarkers();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="dashboard-container">
      <div className="side-panel">
        <header>
          <div>
            <h2 style={{ margin: 0 }}>Driver: {user.name.split(' ')[0]}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: phase === 'available' ? 'var(--primary)' : 'var(--warning)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{phase}</span>
            </div>
          </div>
          <button onClick={onLogout} className="secondary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </header>

        <nav style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? '' : 'secondary'} style={{ flex: 1 }}>Dashboard</button>
          <button onClick={() => setView('history')} className={view === 'history' ? '' : 'secondary'} style={{ flex: 1 }}>History</button>
        </nav>

        {view === 'history' ? <RideHistory /> : (
          <div className="card">
            {phase === 'available' && (
              <div>
                <h3>Incoming Requests</h3>
                {requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p>No active requests nearby.</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req.request_id || req.requestId} style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid var(--bg-accent)' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}><strong style={{ color: 'var(--primary)' }}>PICKUP:</strong> {req.pickup_label || req.pickupLabel}</p>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}><strong style={{ color: 'var(--text-muted)' }}>DEST:</strong> {req.dest_label || req.destLabel}</p>
                      </div>
                      <button onClick={() => handleAccept(req.request_id || req.requestId)} style={{ width: '100%' }}>Accept Ride</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {(phase === 'accepted' || phase === 'inProgress') && (
              <div>
                <h3 style={{ color: 'var(--primary)' }}>Current Trip</h3>
                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}><strong>From:</strong> {currentRide?.pickup_label || currentRide?.pickupLabel}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>To:</strong> {currentRide?.dest_label || currentRide?.destLabel}</p>
                </div>

                {phase === 'accepted' ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleStart} style={{ flex: 1 }}>Start Ride</button>
                    <button onClick={() => setPhase('available')} className="danger">Decline</button>
                  </div>
                ) : (
                  <button onClick={handleComplete} style={{ width: '100%', background: 'var(--primary)' }}>Complete Ride</button>
                )}
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
