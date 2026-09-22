import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminFormFieldProps {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  children: React.ReactElement<Record<string, unknown>>;
}

export function AdminFormField({
  label,
  required = false,
  helperText,
  error,
  className,
  children,
}: AdminFormFieldProps) {
  const generatedId = useId();
  const childId = typeof children.props.id === 'string' ? children.props.id : generatedId;
  const helperId = helperText ? `${childId}-helper` : undefined;
  const errorId = error ? `${childId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={childId} className="text-xs font-bold uppercase tracking-[0.11em] text-zinc-300">
          {label}
        </label>
        {required && (
          <span className="rounded-full border border-[#E50914]/30 bg-[#E50914]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#ff5a64]">
            Required
          </span>
        )}
      </div>
      {React.cloneElement(children, {
        id: childId,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}
      {helperText && !error && (
        <p id={helperId} className="text-xs leading-5 text-zinc-400">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-2 text-xs font-semibold leading-5 text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export const adminInputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-500 hover:border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-rose-500/70 aria-[invalid=true]:focus:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/20';

export const adminTextareaClass =
  'min-h-32 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-500 hover:border-white/20 focus:border-white/40 focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-rose-500/70 aria-[invalid=true]:focus:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/20';
