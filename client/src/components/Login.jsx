// client/src/components/Login.jsx
import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(formData);
      localStorage.setItem('token', data.token); // Store session token
      setUser(data.user); // Update global app state
      
      // Redirect based on the Actor role
      if (data.user.role === 'rider') navigate('/rider');
      else navigate('/driver');
    } catch (err) {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
      <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;