import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

const ICON_STYLES: Record<ToastType, string> = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-[#E50914]',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const timeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const handle = timeouts.current.get(id);
    if (handle) clearTimeout(handle);
    timeouts.current.delete(id);
  }, []);

  const push = useCallback(
    (type: ToastType, message: string, duration: number) => {
      const id = ++toastCounter;
      setToasts((prev) => [...prev, { id, type, message }]);
      const handle = setTimeout(() => dismiss(id), duration);
      timeouts.current.set(id, handle);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => push('success', message, 3500),
      error: (message) => push('error', message, 5000),
      info: (message) => push('info', message, 3500),
    }),
    [push],
  );

  useEffect(() => {
    const handles = timeouts.current;
    return () => handles.forEach((handle) => clearTimeout(handle));
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -12, scale: shouldReduceMotion ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8, scale: shouldReduceMotion ? 1 : 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-popover p-4 shadow-2xl"
              role="status"
            >
              <span className="shrink-0 pt-0.5">
                {toast.type === 'success' && <CheckCircle2 className={cn('h-5 w-5', ICON_STYLES.success)} aria-hidden="true" />}
                {toast.type === 'error' && <XCircle className={cn('h-5 w-5', ICON_STYLES.error)} aria-hidden="true" />}
                {toast.type === 'info' && <Info className={cn('h-5 w-5', ICON_STYLES.info)} aria-hidden="true" />}
              </span>
              <p className="flex-1 text-sm font-medium text-foreground leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-m-1.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}