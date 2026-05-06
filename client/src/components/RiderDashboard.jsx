import React, { useState, useEffect, useCallback } from 'react';
import { requestRide, getRideDetails, getActiveRide } from '../api';
import { useNavigate } from 'react-router-dom';

const RiderDashboard = ({ user }) => {
  const navigate = useNavigate(); 
  const [rideData, setRideData] = useState({ pickupLocation: '', destination: '', fare: 25 });
  const [currentRide, setCurrentRide] = useState(null);

  // Fetch active ride on mount
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await getActiveRide(user.id, 'rider');
        if (res.data) {
          setCurrentRide(res.data);
        }
      } catch (err) {
        console.error("Error fetching active ride:", err);
      }
    };
    fetchActive();
  }, [user.id]);

  // Polling for ride updates
  useEffect(() => {
    let interval;
    
    const checkStatus = async () => {
      if (currentRide && currentRide.status !== 'completed' && currentRide.status !== 'cancelled') {
        try {
          const res = await getRideDetails(currentRide._id);
          if (res.data.status !== currentRide.status) {
            setCurrentRide(res.data);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }
    };

    if (currentRide && (currentRide.status === 'requested' || currentRide.status === 'accepted' || currentRide.status === 'in_progress')) {
      interval = setInterval(checkStatus, 3000);
    }

    return () => clearInterval(interval);
  }, [currentRide]);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await requestRide({ ...rideData, riderId: user.id });
      setCurrentRide(res.data);
    } catch (err) {
      alert("Failed to request ride");
    }
  };

  return (
    <div className="dashboard">
      <h1>Rider Dashboard</h1>
      
      {(!currentRide || currentRide.status === 'cancelled') ? (
        <div className="card">
          <h3>Request a New Ride</h3>
          <form onSubmit={handleRequest}>
            <input 
              type="text" 
              placeholder="Pickup Location" 
              className="auth-form input"
              onChange={(e) => setRideData({...rideData, pickupLocation: e.target.value})} 
              required 
            />
            <input 
              type="text" 
              placeholder="Destination" 
              className="auth-form input"
              onChange={(e) => setRideData({...rideData, destination: e.target.value})} 
              required 
            />
            <div style={{ margin: '15px 0' }}>
              <strong>Estimated Fare:</strong> ${rideData.fare}
            </div>
            <button type="submit" className="btn btn-primary">Request Ride</button>
          </form>
        </div>
      ) : (
        <div className="card">
          <h2>Trip Details</h2>
          <div style={{ marginBottom: '15px' }}>
            <span className={`status-tag status-${currentRide.status}`}>
              {currentRide.status.replace('_', ' ')}
            </span>
          </div>
          <p><strong>From:</strong> {currentRide.pickupLocation}</p>
          <p><strong>To:</strong> {currentRide.destination}</p>
          <p><strong>Fare:</strong> ${currentRide.fare}</p>

          {currentRide.status === 'requested' && (
            <p className="loading-text">Searching for available drivers...</p>
          )}

          {currentRide.status === 'accepted' && (
            <div className="info-box" style={{ background: '#e7f3ff', padding: '15px', borderRadius: '4px', marginTop: '15px' }}>
              <p>A driver has accepted your request and is on the way!</p>
            </div>
          )}

          {currentRide.status === 'in_progress' && (
            <div className="info-box success" style={{ background: '#f6fff8', padding: '15px', borderRadius: '4px', border: '1px solid #d4edda', marginTop: '15px' }}>
              <p>You are currently on your trip. Enjoy the ride!</p>
            </div>
          )}

          {currentRide.status === 'completed' && (
            <div className="action-box" style={{ border: '2px solid #28a745', padding: '15px', borderRadius: '8px', marginTop: '20px', background: '#f8fff9' }}>
              <h3>Ride Finished!</h3>
              <p>Your trip from <strong>{currentRide.pickupLocation}</strong> to <strong>{currentRide.destination}</strong> is done.</p>
              <p>Please proceed to payment to complete the process.</p>
              <button 
                onClick={() => navigate('/payment', { 
                  state: { rideId: currentRide._id, fare: currentRide.fare } 
                })}
                className="btn btn-success"
                style={{ width: '100%', padding: '15px', fontSize: '1.1rem', marginTop: '10px' }}
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;