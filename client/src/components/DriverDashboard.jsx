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
      {activeRide.status === 'accepted' && (
        <button onClick={async () => {
            const res = await axios.post('http://localhost:5000/api/rides/start', { rideId: activeRide._id });
            setActiveRide(res.data);
        }}>
            Start Ride
        </button>
        )}

        {activeRide.status === 'in_progress' && (
        <button onClick={async () => {
            const res = await axios.post('http://localhost:5000/api/rides/complete', { rideId: activeRide._id });
            setActiveRide(res.data);
            alert("Ride finished! Proceed to payment.");
        }}>
            End Ride
        </button>
        )}
    </div>
  );
};

export default DriverDashboard;