// client/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import RiderDashboard from './components/RiderDashboard';
import DriverDashboard from './components/DriverDashboard';
import PaymentPage from './components/PaymentPage';
import Navbar from './components/Navbar';
import History from './components/History';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/rider" element={user?.role === 'rider' ? <RiderDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/driver" element={user?.role === 'driver' ? <DriverDashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/history" element={user ? <History user={user} /> : <Navigate to="/login" />} />
          
          <Route path="/" element={<Navigate to={user ? (user.role === 'rider' ? '/rider' : '/driver') : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;