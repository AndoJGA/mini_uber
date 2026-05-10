import React, { useState, useEffect } from 'react';
import { getRiderHistory, getDriverHistory } from '../api';

const History = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (user.role === 'rider') {
          const res = await getRiderHistory(user.id);
          setHistory(res.data);
        } else {
          const res = await getDriverHistory(user.id);
          setHistory(res.data.rides);
          setTotalEarnings(res.data.totalEarnings);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) return <p>Loading history...</p>;

  return (
    <div className="dashboard">
      <h1>Trip History</h1>
      
      {user.role === 'driver' && (
        <div className="card earnings-card" style={{ background: '#e3f2fd', border: '1px solid #2196f3' }}>
          <h3>Total Earnings</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2', margin: '10px 0' }}>
            ${totalEarnings.toFixed(2)}
          </p>
        </div>
      )}

      <div className="card">
        <h3>Past Trips</h3>
        {history.length > 0 ? (
          <div className="history-list">
            {history.map((ride) => (
              <div key={ride._id} className="history-item card" style={{ border: '1px solid #eee', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p><strong>From:</strong> {ride.pickupLocation}</p>
                    <p><strong>To:</strong> {ride.destination}</p>
                    <p style={{ fontSize: '0.8rem', color: '#777' }}>
                      {new Date(ride.createdAt).toLocaleString()}
                    </p>
                    {ride.paymentDetails && ride.paymentDetails.length > 0 ? (
                      <span className="status-tag status-completed" style={{ background: '#d4edda', color: '#155724' }}>
                        Paid (ID: {ride.paymentDetails[0].transactionId})
                      </span>
                    ) : (
                      ride.status === 'completed' && (
                        <span className="status-tag status-requested" style={{ background: '#f8d7da', color: '#721c24' }}>
                          Payment Pending
                        </span>
                      )
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>${ride.fare}</p>
                    <span className={`status-tag status-${ride.status}`}>
                      {ride.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No trips found.</p>
        )}
      </div>
    </div>
  );
};

export default History;