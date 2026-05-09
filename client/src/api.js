const BASE = '/api';
function getToken() { return sessionStorage.getItem('token'); }

async function apiFetch(path, opts={}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const login = (email, password) =>
  apiFetch('/auth/login', { method:'POST', body:{email,password} });

export const register = (payload) =>
  apiFetch('/auth/register', { method:'POST', body:payload });

export const requestRide = (payload) =>
  apiFetch('/rides', { method:'POST', body:payload });

export const acceptRide = (id) =>
  apiFetch(`/rides/${id}/accept`, { method:'POST' });

export const startRide = (id) =>
  apiFetch(`/rides/${id}/start`, { method:'PATCH' });

export const completeRide = (id) =>
  apiFetch(`/rides/${id}/complete`, { method:'PATCH' });

export const cancelRide = (id) =>
  apiFetch(`/rides/${id}`, { method:'DELETE' });

export const getHistory = () => apiFetch('/rides/history');
