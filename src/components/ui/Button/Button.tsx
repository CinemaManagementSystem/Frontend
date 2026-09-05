import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-[#E50914] hover:bg-[#ff1f2d] text-white',
    outline:
      'bg-transparent border border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted',
    ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
