import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    // Auto-dismiss after 3.5s
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo<ToastContextValue>(() => ({
    showSuccess: (msg) => add('success', msg),
    showError: (msg) => add('error', msg),
    showInfo: (msg) => add('info', msg),
  }), [add]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-[0_10px_30px_rgba(12,14,32,0.15)] bg-white w-[320px] max-w-[90vw]',
                t.type === 'success' ? 'border-green-200' : t.type === 'error' ? 'border-red-200' : 'border-blue-200'
              ].join(' ')}
            >
              <div className={[
                'mt-1 h-2 w-2 shrink-0 rounded-full',
                t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              ].join(' ')} />
              <div className="flex-1">
                <p className="font-montessart text-sm text-gray-800">
                  {t.message}
                </p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="ml-2 rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
