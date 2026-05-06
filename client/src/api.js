import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Automatically attach the Auth Token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

// Ride endpoints
export const requestRide = (rideData) => API.post('/rides/request', rideData);
export const getAvailableRides = () => API.get('/rides/available');
export const acceptRide = (rideId, driverId) => API.post('/rides/accept', { rideId, driverId });
export const startRide = (rideId) => API.post('/rides/start', { rideId });
export const completeRide = (rideId) => API.post('/rides/complete', { rideId });
export const getRideDetails = (rideId) => API.get(`/rides/${rideId}`);
export const processPayment = (paymentData) => API.post('/rides/pay', paymentData);

export const getActiveRide = (userId, role) => API.get('/rides/active', { params: { userId, role } });
export const getRiderHistory = (riderId) => API.get(`/rides/history/rider/${riderId}`);
export const getDriverHistory = (driverId) => API.get(`/rides/history/driver/${driverId}`);

export default API;