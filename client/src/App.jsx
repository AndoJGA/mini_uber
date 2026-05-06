// client/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import RiderDashboard from './components/RiderDashboard';
import DriverDashboard from './components/DriverDashboard';

function App() {
  const [user, setUser] = useState(null); // Centralized state for the logged-in Actor

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        {/* Conditional rendering based on role */}
        <Route path="/rider" element={user?.role === 'rider' ? <RiderDashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/driver" element={user?.role === 'driver' ? <DriverDashboard user={user} /> : <Navigate to="/login" />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;