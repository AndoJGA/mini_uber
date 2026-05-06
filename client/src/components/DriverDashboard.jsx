// client/src/components/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For fetching available rides
import { acceptRide } from '../api';

const DriverDashboard = ({ user }) => {
  const [availableRides, setAvailableRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    // Fetch only rides with 'requested' status
    const fetchRides = async () => {
      const res = await axios.get('http://localhost:5000/api/rides/available');
      setAvailableRides(res.data);
    };
    if (!activeRide) fetchRides();
  }, [activeRide]);

  const handleAccept = async (rideId) => {
    try {
      const res = await acceptRide(rideId, user.id);
      setActiveRide(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Driver Dashboard</h1>
      {activeRide ? (
        <div>
          <h2>Current Trip</h2>
          <p>Pickup: {activeRide.pickupLocation}</p>
          <p>Status: {activeRide.status}</p>
          <button>Complete Ride</button>
        </div>
      ) : (
        <div>
          <h2>Available Requests</h2>
          {availableRides.map(ride => (
            <div key={ride._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <p>{ride.pickupLocation} ➔ {ride.destination}</p>
              <button onClick={() => handleAccept(ride._id)}>Accept Ride</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;