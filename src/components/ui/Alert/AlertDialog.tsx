import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export type AlertDialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: AlertDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
}

const variantStyles: Record<
  AlertDialogVariant,
  {
    icon: React.ReactNode;
    iconClassName: string;
    confirmClassName: string;
  }
> = {
  danger: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconClassName: 'bg-destructive/10 text-destructive',
    confirmClassName: 'bg-destructive text-white hover:bg-destructive/90',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconClassName: 'bg-amber-500/10 text-amber-500',
    confirmClassName: 'bg-amber-500 text-white hover:bg-amber-500/90',
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    iconClassName: 'bg-sky-500/10 text-sky-500',
    confirmClassName: 'bg-sky-500 text-white hover:bg-sky-500/90',
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClassName: 'bg-emerald-500/10 text-emerald-500',
    confirmClassName: 'bg-emerald-500 text-white hover:bg-emerald-500/90',
  },
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const styles = variantStyles[variant];
  const isToast = variant === 'success' && !onConfirm;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirming) onClose();
    };

    if (!isToast) {
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (!isToast) {
        document.body.style.overflow = 'unset';
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isConfirming, isToast, onClose]);

  useEffect(() => {
    if (!isOpen || !isToast) return undefined;

    const timeoutId = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, isToast, onClose]);

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose();
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={
            isToast
              ? 'fixed right-0 top-0 z-[70] p-4'
              : 'fixed inset-0 z-[60] flex items-center justify-center p-4'
          }
        >
          {!isToast && (
            <motion.button
              type="button"
              aria-label="Close alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 cursor-default bg-black/75 backdrop-blur-sm"
              onClick={() => {
                if (!isConfirming) onClose();
              }}
            />
          )}

          <motion.div
            role={isToast ? 'status' : 'alertdialog'}
            aria-live={isToast ? 'polite' : undefined}
            aria-modal={isToast ? undefined : true}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            initial={{
              opacity: 0,
              scale: shouldReduceMotion || isToast ? 1 : 0.96,
              x: shouldReduceMotion || !isToast ? 0 : 16,
              y: shouldReduceMotion || isToast ? 0 : 8,
            }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{
              opacity: 0,
              scale: shouldReduceMotion || isToast ? 1 : 0.96,
              x: shouldReduceMotion || !isToast ? 0 : 16,
              y: shouldReduceMotion || isToast ? 0 : 8,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={
              isToast
                ? 'relative z-10 w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-xl border border-emerald-500/20 bg-popover p-4 text-popover-foreground shadow-2xl'
                : 'relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl'
            }
          >
            <button
              type="button"
              aria-label="Close alert"
              onClick={onClose}
              disabled={isConfirming}
              className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className={isToast ? 'flex gap-3 pr-7' : 'flex gap-4 pr-6'}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconClassName}`}>
                {styles.icon}
              </div>
              <div>
                <h2 id="alert-dialog-title" className="text-base font-bold text-foreground">
                  {title}
                </h2>
                <p id="alert-dialog-description" className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>

            {!isToast && (
              <div className="mt-6 flex justify-end gap-2">
              {onConfirm && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isConfirming}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={isConfirming}
                className={`inline-flex min-w-24 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles.confirmClassName}`}
              >
                {isConfirming ? 'Please wait...' : onConfirm ? confirmLabel : 'Close'}
              </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
