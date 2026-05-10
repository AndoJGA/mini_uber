import { useState, useEffect } from 'react';
import * as api from '../api';

export default function RideHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner"></div></div>;

  const completedRides = history.filter(r => r.status === 'completed');
  const total = completedRides.reduce((acc, r) => acc + (r.fare_amount || r.fareAmount || 0), 0);

  return (
    <div>
      <div className="card" style={{ background: 'var(--primary)', color: 'var(--secondary)', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total for completed trips</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{total.toFixed(2)} ETB</div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Past Trips</h3>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          No rides found yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map(ride => (
            <div key={ride.request_id || ride.requestId} className="card" style={{ padding: '1rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(ride.requested_at || ride.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className={`badge ${ride.status === 'completed' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                  {ride.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%' }}></div>
                  <div style={{ width: '1px', flex: 1, background: 'var(--border)' }}></div>
                  <div style={{ width: '6px', height: '6px', background: 'var(--text)', borderRadius: '1px' }}></div>
                </div>
                <div style={{ flex: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ marginBottom: '4px' }}>{ride.pickup_label || ride.pickupLabel}</div>
                  <div>{ride.dest_label || ride.destLabel}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ride.rideType || 'Economy'}</span>
                <span style={{ fontWeight: '700' }}>
                  {ride.fare_amount || ride.fareAmount ? `${(ride.fare_amount || ride.fareAmount).toFixed(2)} ETB` : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
