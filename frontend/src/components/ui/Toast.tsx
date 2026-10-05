'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const DOT: Record<ToastType, string> = {
  success: 'bg-[#7fd18b]',
  error: 'bg-[#ff7a66]',
  warning: 'bg-[#f3c64b]',
  info: 'bg-[#8fc3ff]',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Math.random().toString(36).slice(2, 11);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          role="region"
          aria-label="Notifications"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="alert"
              className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-paper shadow-[0_18px_40px_-16px_rgba(23,34,27,0.7)] animate-[toast-in_0.25s_ease-out]"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[t.type]}`} />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss"
                className="rounded-full px-2 py-1 text-xs font-semibold text-paper/60 hover:text-paper"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
