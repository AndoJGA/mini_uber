import { useState } from 'react';
import * as api from '../api';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'passenger',
    vehiclePlate: '', vehicleModel: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { token } = await api.login(formData.email, formData.password);
        onLogin(token);
      } else {
        await api.register(formData);
        const { token } = await api.login(formData.email, formData.password);
        onLogin(token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setIsLogin(true)} 
          className={isLogin ? "btn btn-primary" : "btn btn-outline"}
          style={{ flex: 1 }}
        >
          Login
        </button>
        <button 
          onClick={() => setIsLogin(false)} 
          className={!isLogin ? "btn btn-primary" : "btn btn-outline"}
          style={{ flex: 1 }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="input-group">
            <label>Name</label>
            <input 
              type="text" 
              required 
              placeholder="John Doe"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        )}
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            required 
            placeholder="john@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            required 
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        {!isLogin && (
          <>
            <div className="input-group">
              <label>Join as</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    value="passenger" 
                    checked={formData.role === 'passenger'}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  /> Passenger
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    value="driver" 
                    checked={formData.role === 'driver'}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  /> Driver
                </label>
              </div>
            </div>

            {formData.role === 'driver' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Vehicle Model</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Toyota Vitz"
                    value={formData.vehicleModel}
                    onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Plate Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="AA-2-B12345"
                    value={formData.vehiclePlate}
                    onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <div className="spinner" style={{ borderLeftColor: '#fff' }}></div> : (isLogin ? 'Login' : 'Create Account')}
        </button>
      </form>
    </div>
  );
}
