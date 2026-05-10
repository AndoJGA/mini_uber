import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import * as api from '../api';
import RideHistory from './RideHistory';

export default function DriverDashboard({ user, onLogout }) {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'history'
  const [phase, setPhase] = useState('available'); // available | accepted | inProgress
  const [requests, setRequests] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubNew = subscribe('NEW_RIDE_REQUEST', (ride) => {
      setRequests(prev => [...prev, ride]);
    });
    const unsubTaken = subscribe('REQUEST_TAKEN', ({ requestId }) => {
      setRequests(prev => prev.filter(x => (x.request_id || x.requestId) !== requestId));
    });
    const unsubFare = subscribe('FARE_UPDATE', (data) => {
      setCurrentRide(prev => ({ ...prev, fareAmount: data.fare, fare_amount: data.fare }));
    });
    const unsubCancel = subscribe('RIDE_CANCELLED', () => {
      alert('Passenger cancelled the ride');
      setPhase('available');
      setCurrentRide(null);
    });

    return () => {
      unsubNew(); unsubTaken(); unsubFare(); unsubCancel();
    };
  }, [subscribe]);

  const handleAccept = async (requestId) => {
    try {
      const ride = await api.acceptRide(requestId);
      setCurrentRide(ride);
      setPhase('accepted');
      setRequests([]);
    } catch (err) {
      alert(err.message === 'ALREADY_TAKEN' ? 'Ride already taken by another driver' : err.message);
      setRequests(prev => prev.filter(x => (x.request_id || x.requestId) !== requestId));
    }
  };

  const handleStart = async () => {
    try {
      await api.startRide(currentRide.request_id || currentRide.requestId);
      setPhase('inProgress');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async () => {
    try {
      const { fare } = await api.completeRide(currentRide.request_id || currentRide.requestId);
      alert(`Ride completed! Fare: ${fare?.toFixed(2) || '0.00'} ETB`);
      setPhase('available');
      setCurrentRide(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async () => {
    try {
      await api.cancelRide(currentRide.request_id || currentRide.requestId);
      setPhase('available');
      setCurrentRide(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="app-header">
        <div>
          <h2 style={{ marginBottom: '4px' }}>Welcome, {user?.name || 'Driver'}</h2>
          <span className={`badge ${phase === 'available' ? 'badge-success' : 'badge-warning'}`}>
            {phase.replace('_', ' ')}
          </span>
        </div>
        <button onClick={onLogout} className="btn btn-link">Logout</button>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setView('dashboard')} 
          className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.5rem' }}
        >
          Jobs
        </button>
        <button 
          onClick={() => setView('history')} 
          className={`btn ${view === 'history' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.5rem' }}
        >
          Earnings
        </button>
      </div>

      {view === 'history' ? (
        <RideHistory />
      ) : (
        <div className="card">
          {phase === 'available' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>New Requests</h3>
              {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                  <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                  <p>Searching for nearby trips...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {requests.map(req => (
                    <div key={req.request_id || req.requestId} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></div>
                          <div style={{ width: '1px', flex: 1, background: 'var(--border)' }}></div>
                          <div style={{ width: '8px', height: '8px', background: 'var(--text)', borderRadius: '2px' }}></div>
                        </div>
                        <div style={{ flex: 1, fontSize: '0.875rem' }}>
                          <div style={{ marginBottom: '8px' }}>{req.pickup_label || req.pickupLabel}</div>
                          <div>{req.dest_label || req.destLabel}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAccept(req.request_id || req.requestId)}
                        className="btn btn-primary"
                      >
                        Accept Ride
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(phase === 'accepted' || phase === 'inProgress') && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Current Trip</h3>
              <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Trip Fare</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>
                    {(currentRide?.fareAmount || currentRide?.fare_amount || 0).toFixed(2)} ETB
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></div>
                    <div style={{ width: '1px', flex: 1, background: 'var(--border)' }}></div>
                    <div style={{ width: '8px', height: '8px', background: 'var(--text)', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.875rem' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>PICKUP</span>
                      {currentRide?.pickup_label || currentRide?.pickupLabel}
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>DESTINATION</span>
                      {currentRide?.dest_label || currentRide?.destLabel}
                    </div>
                  </div>
                </div>
              </div>

              {phase === 'accepted' ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleStart} className="btn btn-primary" style={{ flex: 2 }}>
                    Start Ride
                  </button>
                  <button onClick={handleCancel} className="btn btn-danger" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={handleComplete} className="btn btn-primary">
                  Complete Trip
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
