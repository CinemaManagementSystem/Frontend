import React, { useState, useId } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, label, error, id, autoComplete = 'current-password', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [visible, setVisible] = useState(false);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id={inputId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            autoComplete={autoComplete}
            className={cn(
              'w-full bg-muted text-foreground text-sm rounded-lg border border-border px-3.5 py-2.5 pl-10 pr-10 outline-none transition-all',
              'placeholder:text-muted-foreground focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';