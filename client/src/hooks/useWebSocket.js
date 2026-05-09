import { useEffect, useRef, useCallback } from 'react';
const WS_URL = `ws://${window.location.hostname}:3000`;

export function useWebSocket() {
  const ws = useRef(null);
  const handlers = useRef({});

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'AUTH',
        token
      }));
    };

    socket.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        if (handlers.current[event]) {
          handlers.current[event].forEach(cb => cb(data));
        }
      } catch (err) {
        console.error('WS Message Error:', err);
      }
    };

    return () => socket.close();
  }, []);

  const subscribe = useCallback((event, cb) => {
    if (!handlers.current[event]) handlers.current[event] = [];
    handlers.current[event].push(cb);
    
    return () => {
      handlers.current[event] = handlers.current[event].filter(x => x !== cb);
    };
  }, []);

  return { 
    subscribe,
    send: (msg) => ws.current?.send(JSON.stringify(msg)),
    isConnected: ws.current?.readyState === 1 
  };
}
