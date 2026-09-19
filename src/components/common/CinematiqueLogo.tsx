import React from 'react';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/cinematique-logo.jpg';

interface CinematiqueLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  useImage?: boolean;
}

export const CinematiqueLogo: React.FC<CinematiqueLogoProps> = ({
  className,
  size = 'md',
  useImage = false,
}) => {
  const heights = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  if (useImage) {
    return (
      <div className={cn('inline-flex items-center select-none', className)}>
        <img
          src={logoImg}
          alt="CINEMATIQUE Logo"
          className={cn('w-auto object-contain rounded-full shadow-md', heights[size])}
        />
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Red Circle Badge with Film Reel Icon matching Picture 2 */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.65)] transition-transform hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 shrink-0 text-white"
          aria-hidden="true"
        >
          <path d="M18 3H6C4.34 3 3 4.34 3 6V18C3 19.66 4.34 21 6 21H18C19.66 21 21 19.66 21 18V6C21 4.34 19.66 3 18 3ZM7 19H5V17H7V19ZM7 15H5V13H7V15ZM7 11H5V9H7V11ZM7 7H5V5H7V7ZM19 19H17V17H19V19ZM19 15H17V13H19V15ZM19 11H17V9H19V11ZM19 7H17V5H19V7ZM15 19H9V5H15V19Z" />
        </svg>
      </span>

      {/* Brand Text: CINEMA (Dark in Light Mode, White in Dark Mode) TIQUE (Red) */}
      <span className="text-xl font-black uppercase tracking-wider font-sans leading-none flex items-center">
        <span className="text-foreground dark:text-white">
          CINEMA
        </span>
        <span className="text-[#E50914]">
          TIQUE
        </span>
      </span>
    </div>
  );
};
