import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import Toast from './components/Toast';

function decodeJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}
export default function App() {
  const [user, setUser] = useState(() => {
    const t = sessionStorage.getItem('token');
    return t ? decodeJwt(t) : null;
  });
  const onLogin = (token) => {
    sessionStorage.setItem('token', token);
    setUser(decodeJwt(token));
  };
  const onLogout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
  };
  if (!user) return <><AuthPage onLogin={onLogin}/><Toast/></>;
  if (user.role==='passenger')
    return <><PassengerDashboard user={user} onLogout={onLogout}/><Toast/></>;
  return <><DriverDashboard user={user} onLogout={onLogout}/><Toast/></>;
}