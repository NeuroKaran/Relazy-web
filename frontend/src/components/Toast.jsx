import { useState, useEffect, useCallback } from 'react';

let toastId = 0;
const listeners = new Set();
let toasts = [];

function notify(msg) {
  const id = ++toastId;
  toasts = [...toasts, { id, msg, hiding: false }];
  listeners.forEach(fn => fn([...toasts]));
  setTimeout(() => {
    toasts = toasts.map(t => t.id === id ? { ...t, hiding: true } : t);
    listeners.forEach(fn => fn([...toasts]));
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      listeners.forEach(fn => fn([...toasts]));
    }, 350);
  }, 3000);
}

export function useToast() {
  const [items, setItems] = useState([]);
  useEffect(() => { listeners.add(setItems); return () => listeners.delete(setItems); }, []);
  return { items, notify };
}

export { notify };

export default function Toast({ items }) {
  if (!items.length) return null;
  return (
    <div className="toast-container">
      {items.map(t => (
        <div key={t.id} className={`toast ${t.hiding ? 'hide' : ''}`} style={{ marginBottom: 8 }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
