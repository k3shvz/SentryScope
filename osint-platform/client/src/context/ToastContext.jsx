import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

let idCounter = 0;

const VARIANTS = {
  success: { icon: FiCheckCircle, color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' },
  error: { icon: FiXCircle, color: '#FF5D73', bg: 'rgba(255,93,115,0.1)' },
  warning: { icon: FiAlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  info: { icon: FiInfo, color: '#00E5FF', bg: 'rgba(0,229,255,0.1)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = 'info', duration = 4200) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2.5rem))]">
        <AnimatePresence>
          {toasts.map((t) => {
            const v = VARIANTS[t.variant] || VARIANTS.info;
            const Icon = v.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-xl px-4 py-3 flex items-start gap-3 shadow-card"
                role="status"
              >
                <Icon size={18} color={v.color} style={{ marginTop: 1, flexShrink: 0 }} />
                <p className="text-sm text-text leading-snug flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-text-faint hover:text-text-muted transition-colors"
                  aria-label="Dismiss notification"
                >
                  <FiX size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
