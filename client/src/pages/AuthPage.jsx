import { useState } from 'react';
import * as api from '../api';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'passenger',
    vehiclePlate: '', vehicleModel: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚕</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Mini Uber</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Premium Ride-Sharing MVP</p>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <button 
            onClick={() => setIsLogin(true)} 
            className={isLogin ? '' : 'secondary'}
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={!isLogin ? '' : 'secondary'}
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" required 
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" required 
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Join as</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, padding: '0.75rem', background: formData.role === 'passenger' ? 'var(--bg-accent)' : 'transparent', borderRadius: '8px', border: '1px solid var(--bg-accent)' }}>
                    <input 
                      type="radio" value="passenger" 
                      checked={formData.role === 'passenger'}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      style={{ width: 'auto' }}
                    /> <span style={{ fontSize: '0.875rem' }}>Passenger</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, padding: '0.75rem', background: formData.role === 'driver' ? 'var(--bg-accent)' : 'transparent', borderRadius: '8px', border: '1px solid var(--bg-accent)' }}>
                    <input 
                      type="radio" value="driver" 
                      checked={formData.role === 'driver'}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      style={{ width: 'auto' }}
                    /> <span style={{ fontSize: '0.875rem' }}>Driver</span>
                  </label>
                </div>
              </div>

              {formData.role === 'driver' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div className="form-group">
                    <label>Vehicle Model</label>
                    <input 
                      type="text" required 
                      placeholder="e.g. Toyota Corolla"
                      value={formData.vehicleModel}
                      onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>License Plate</label>
                    <input 
                      type="text" required 
                      placeholder="e.g. AA-12345"
                      value={formData.vehiclePlate}
                      onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
