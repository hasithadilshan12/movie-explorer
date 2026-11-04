import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let nextId = 0;
const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type, message, options = {}) => {
      const id = ++nextId;
      setToasts((current) => [...current.slice(-3), { id, type, message, title: options.title }]);
      window.setTimeout(() => remove(id), options.duration || 4200);
    },
    [remove]
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => push('success', message, options),
      error: (message, options) => push('error', message, options),
      info: (message, options) => push('info', message, options),
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-viewport" aria-live="polite">
        {toasts.map((item) => {
          const Icon = ICONS[item.type] || Info;
          return (
            <div key={item.id} className={`toast toast-${item.type}`} role="status">
              <Icon size={20} className="toast-icon" />
              <div className="toast-content">
                {item.title && <strong>{item.title}</strong>}
                <p>{item.message}</p>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => remove(item.id)}
                aria-label="Dismiss notification"
                title="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
