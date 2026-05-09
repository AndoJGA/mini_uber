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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--bg-accent)' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Your Recent Trips</h3>
      </div>
      
      {history.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No rides in your history yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Trip Details</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Fare</th>
              </tr>
            </thead>
            <tbody>
              {history.map(ride => (
                <tr key={ride.request_id || ride.requestId}>
                  <td style={{ fontSize: '0.875rem' }}>
                    {new Date(ride.requested_at || ride.requestedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      {ride.pickup_label || ride.pickupLabel}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      to {ride.dest_label || ride.destLabel}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${ride.status}`}>
                      {ride.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {ride.fare_amount || ride.fareAmount 
                      ? `${(ride.fare_amount || ride.fareAmount).toFixed(2)} ETB` 
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
