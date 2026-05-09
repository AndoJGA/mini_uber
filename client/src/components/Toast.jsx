import { createContext, useContext, useState, useCallback } from 'react';
export const ToastContext = createContext(null);

export function useToast() { return useContext(ToastContext); }

export default function Toast({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type='info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}