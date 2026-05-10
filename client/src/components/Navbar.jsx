import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Mini Uber</Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/history" style={{ marginRight: '15px' }}>History</Link>
            <span>Welcome, <strong>{user.name}</strong> ({user.role})</span>
            <button onClick={handleLogoutClick} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;