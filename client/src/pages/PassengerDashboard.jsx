import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import * as api from '../api';
import RideHistory from './RideHistory';

export default function PassengerDashboard({ user, onLogout }) {
  const [view, setView] = useState('ride'); // 'ride' | 'history'
  const [phase, setPhase] = useState('idle'); // idle | searching | accepted | inProgress | completed
  const [formData, setFormData] = useState({ pickup: '', destination: '', rideType: 'economy' });
  const [rideData, setRideData] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [driverPos, setDriverPos] = useState({ lat: 0.5, lng: 0.5 }); // Normalized 0-1 for visualization
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubAssign = subscribe('DRIVER_ASSIGNED', (data) => {
      setDriverInfo(data.driver);
      setPhase('accepted');
    });
    const unsubLoc = subscribe('LOCATION_UPDATE', (pos) => {
      // Normalize lat/lng for the placeholder map
      // Assuming a small bounding box for demo purposes
      const normLat = (pos.lat - 9.0) * 10;
      const normLng = (pos.lng - 38.7) * 10;
      setDriverPos({ lat: normLat, lng: normLng });
    });
    const unsubStart = subscribe('RIDE_STARTED', () => setPhase('inProgress'));
    const unsubArrived = subscribe('DRIVER_ARRIVED', () => {
      alert('Driver has arrived at your location!');
    });
    const unsubComplete = subscribe('RIDE_COMPLETED', (data) => {
      setRideData(prev => ({ ...prev, fareAmount: data.fare, fare_amount: data.fare }));
      setPhase('completed');
    });
    const unsubFare = subscribe('FARE_UPDATE', (data) => {
      setRideData(prev => ({ ...prev, fareAmount: data.fare, fare_amount: data.fare }));
    });
    const unsubTimeout = subscribe('RIDE_TIMEOUT', () => {
      alert('No drivers available at this time.');
      setPhase('idle');
    });
    const unsubCancel = subscribe('RIDE_CANCELLED', (data) => {
      alert(data.reason || 'Ride was cancelled');
      setPhase('idle');
    });

    return () => {
      unsubAssign(); unsubLoc(); unsubStart(); unsubArrived(); unsubComplete(); unsubFare(); unsubTimeout(); unsubCancel();
    };
  }, [subscribe]);

  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  useEffect(() => {
    let timer;
    if (phase === 'searching') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            alert('No driver found.');
            setPhase('idle');
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setTimeLeft(600);
    try {
      const payload = {
        pickupLabel: formData.pickup,
        destLabel: formData.destination,
        pickupLat: 9.0249, pickupLng: 38.7469,
        destLat: 9.0356, destLng: 38.7523,
        rideType: formData.rideType
      };
      const ride = await api.requestRide(payload);
      setRideData(ride);
      setPhase('searching');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async () => {
    if (!rideData) return;
    try {
      await api.cancelRide(rideData.request_id || rideData.requestId);
      setPhase('idle');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="app-header">
        <div>
          <h2 style={{ marginBottom: '4px' }}>Hello, {user?.name || 'User'}</h2>
          <span className="badge badge-info">Passenger</span>
        </div>
        <button onClick={onLogout} className="btn btn-link">Logout</button>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setView('ride')} 
          className={`btn ${view === 'ride' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.5rem' }}
        >
          Request
        </button>
        <button 
          onClick={() => setView('history')} 
          className={`btn ${view === 'history' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.5rem' }}
        >
          History
        </button>
      </div>

      {view === 'history' ? (
        <RideHistory />
      ) : (
        <div className="card">
          {phase === 'idle' && (
            <form onSubmit={handleRequest}>
              <h3 style={{ marginBottom: '1.5rem' }}>Where to?</h3>
              <div className="input-group">
                <label>Pickup Location</label>
                <input 
                  type="text" required placeholder="Current Location"
                  value={formData.pickup}
                  onChange={e => setFormData({ ...formData, pickup: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Destination</label>
                <input 
                  type="text" required placeholder="Enter destination"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Ride Type</label>
                <select 
                  value={formData.rideType} 
                  onChange={e => setFormData({ ...formData, rideType: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text)' }}
                >
                  <option value="economy">Economy - 20 ETB/km</option>
                  <option value="comfort">Comfort - 35 ETB/km</option>
                  <option value="premium">Premium - 50 ETB/km</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Request Ride
              </button>
            </form>
          )}

          {phase === 'searching' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
              <h3>Finding your ride...</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
              <button onClick={handleCancel} className="btn btn-outline" style={{ marginTop: '2rem' }}>Cancel Request</button>
            </div>
          )}

          {(phase === 'accepted' || phase === 'inProgress') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{phase === 'accepted' ? 'Driver is coming' : 'En route'}</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Est. Fare: <strong style={{ color: 'var(--text)' }}>{(rideData?.fareAmount || rideData?.fare_amount || 0).toFixed(2)} ETB</strong>
                  </p>
                </div>
                <span className={`badge ${phase === 'accepted' ? 'badge-warning' : 'badge-success'}`}>
                  {phase === 'accepted' ? 'Accepted' : 'In Progress'}
                </span>
              </div>

              <div className="map-placeholder">
                <div className="map-grid"></div>
                <div 
                  className="map-car" 
                  style={{ 
                    top: `${50 + (driverPos.lat * 50)}%`, 
                    left: `${50 + (driverPos.lng * 50)}%` 
                  }}
                >
                  🚗
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: '8px' }}>
                <div style={{ width: '48px', height: '48px', background: '#ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{driverInfo?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{driverInfo?.vehicleModel} • {driverInfo?.vehiclePlate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>★ 4.9</div>
                </div>
              </div>

              {phase === 'accepted' && (
                <button onClick={handleCancel} className="btn btn-link" style={{ marginTop: '1rem', color: 'var(--error)', width: '100%' }}>Cancel Ride</button>
              )}
            </div>
          )}

          {phase === 'completed' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3>Arrived!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Hope you had a great trip with {driverInfo?.name}</p>
              
              <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--background)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Fare</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(rideData?.fareAmount || rideData?.fare_amount || 0).toFixed(2)} ETB</div>
              </div>

              <button onClick={() => setPhase('idle')} className="btn btn-primary">Done</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
