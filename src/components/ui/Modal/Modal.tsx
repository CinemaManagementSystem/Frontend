import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: shouldReduceMotion ? 1 : 0.96, 
              y: shouldReduceMotion ? 0 : 8 
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              scale: shouldReduceMotion ? 1 : 0.96, 
              y: shouldReduceMotion ? 0 : 8 
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={cn(
              'relative w-full bg-popover border border-border rounded-2xl shadow-2xl p-6 overflow-hidden z-10',
              maxWMap[maxWidth]
            )}
          >
            {title && (
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground tracking-wide">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
