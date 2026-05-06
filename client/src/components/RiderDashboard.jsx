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
      {!currentRide ? (
        <form onSubmit={handleRequest}>
          <input type="text" placeholder="Pickup" onChange={(e) => setRideData({...rideData, pickupLocation: e.target.value})} required />
          <input type="text" placeholder="Destination" onChange={(e) => setRideData({...rideData, destination: e.target.value})} required />
          <p>Estimated Fare: ${rideData.fare}</p>
          <button type="submit">Request Ride</button>
        </form>
      ) : (
        <div>
          <h3>Ride Status: {currentRide.status}</h3>
          <p>From: {currentRide.pickupLocation} To: {currentRide.destination}</p>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;