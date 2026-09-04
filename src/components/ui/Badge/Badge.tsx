import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'warning' | 'success' | 'destructive';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#E50914] text-white border-transparent shadow-sm',
    secondary: 'bg-white/10 text-white border-border backdrop-blur-md',
    outline: 'border-border text-muted-foreground bg-transparent',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    destructive: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  const sizeStyles = {
    sm: 'text-[10px] font-semibold px-2 py-0.5 rounded',
    md: 'text-xs font-medium px-2.5 py-1 rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
