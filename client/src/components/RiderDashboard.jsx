// client/src/components/RiderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { requestRide } from '../api';

const RiderDashboard = ({ user }) => {
  const [rideData, setRideData] = useState({ pickupLocation: '', destination: '', fare: 20 });
  const [currentRide, setCurrentRide] = useState(null);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      // In a real app, fare would be calculated based on distance
      const res = await requestRide({ ...rideData, riderId: user.id });
      setCurrentRide(res.data);
      alert("Ride requested! Waiting for a driver...");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Rider Dashboard</h1>
      // Inside RiderDashboard.jsx
{currentRide?.status === 'completed' && (
  <div>
    <h3>Ride Finished! Total: ${currentRide.fare}</h3>
    <button onClick={async () => {
      await axios.post('http://localhost:5000/api/rides/pay', { 
        rideId: currentRide._id, 
        amount: currentRide.fare 
      });
      alert("Payment successful! Thank you for riding.");
      setCurrentRide(null); // Reset for next ride
    }}>
      Pay Now
    </button>
  </div>
)}
    </div>
  );
};

export default RiderDashboard;