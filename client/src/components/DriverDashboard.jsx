import React, { useState, useEffect } from 'react';
import { getAvailableRides, acceptRide, startRide, completeRide, getActiveRide } from '../api';

const DriverDashboard = ({ user }) => {
  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  // Fetch active ride on mount
  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await getActiveRide(user.id, 'driver');
        if (res.data) {
          setActiveRide(res.data);
        }
      } catch (err) {
        console.error("Error fetching active ride:", err);
      }
    };
    fetchActive();
  }, [user.id]);

  // Poll for available rides if not on a trip
  useEffect(() => {
    let interval;
    const fetchRides = async () => {
      if (!activeRide) {
        try {
          const res = await getAvailableRides();
          setAvailableRides(res.data);
        } catch (err) {
          console.error("Error fetching available rides:", err);
        }
      }
    };

    if (!activeRide) {
      fetchRides();
      interval = setInterval(fetchRides, 5000);
    }
    return () => clearInterval(interval);
  }, [activeRide]);

  const handleAccept = async (rideId) => {
    try {
      const res = await acceptRide(rideId, user.id);
      setActiveRide(res.data);
    } catch (err) {
      alert("Could not accept ride");
    }
  };

  const handleStart = async () => {
    try {
      const res = await startRide(activeRide._id);
      setActiveRide(res.data);
    } catch (err) {
      alert("Could not start ride");
    }
  };

  const handleComplete = async () => {
    try {
      await completeRide(activeRide._id);
      setActiveRide(null);
      alert("Ride completed! Returning to dashboard.");
    } catch (err) {
      alert("Could not complete ride");
    }
  };

  return (
    <div className="dashboard">
      <h1>Driver Dashboard</h1>
      
      {!activeRide ? (
        <div className="card">
          <h2>Available Ride Requests</h2>
          {availableRides.length > 0 ? (
            <div className="ride-list">
              {availableRides.map(ride => (
                <div key={ride._id} className="ride-item card" style={{ border: '1px solid #eee', marginBottom: '10px' }}>
                  <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
                  <p><strong>Destination:</strong> {ride.destination}</p>
                  <p><strong>Fare:</strong> ${ride.fare}</p>
                  <button onClick={() => handleAccept(ride._id)} className="btn btn-primary">
                    Accept Ride
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>Scanning for requests...</p>
          )}
        </div>
      ) : (
        <div className="card">
          <h2>Active Trip</h2>
          <div style={{ marginBottom: '15px' }}>
            <span className={`status-tag status-${activeRide.status}`}>
              {activeRide.status.replace('_', ' ')}
            </span>
          </div>
          <p><strong>Pickup:</strong> {activeRide.pickupLocation}</p>
          <p><strong>Destination:</strong> {activeRide.destination}</p>
          <p><strong>Fare:</strong> ${activeRide.fare}</p>

          <div className="action-buttons" style={{ marginTop: '20px' }}>
            {activeRide.status === 'accepted' && (
              <button onClick={handleStart} className="btn btn-primary" style={{ width: '100%', padding: '15px' }}>
                Start Trip (Picked up Rider)
              </button>
            )}

            {activeRide.status === 'in_progress' && (
              <button onClick={handleComplete} className="btn btn-success" style={{ width: '100%', padding: '15px' }}>
                Complete Trip (Dropped off Rider)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;