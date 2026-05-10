import { useState } from 'react';
import AuthPage from './pages/AuthPage';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import Toast from './components/Toast';

function decodeJwt(token) {
  try { 
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
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
