import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, label }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-[#E50914]' : 'bg-muted border border-border',
      )}
    >
      <motion.span
        animate={{ x: checked ? 20 : 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 32 }}
        className="inline-block h-4 w-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
};