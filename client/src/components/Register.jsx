import React, { useState } from 'react';
import { register } from '../api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'rider' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      alert("Registration successful! Please login.");
    } catch (err) {
      alert("Error: " + err.response.data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input type="text" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
      <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
      <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
        <option value="rider">Rider</option>
        <option value="driver">Driver</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Register;