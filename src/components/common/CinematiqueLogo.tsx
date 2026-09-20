import React from 'react';

import { cn } from '@/lib/utils';
import logoImg from '@/assets/legend-cinema-logo.png';

interface CinematiqueLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CinematiqueLogo: React.FC<CinematiqueLogoProps> = ({
  className,
  size = 'md',
}) => {
  const imageSizes = {
    sm: 'h-7 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto',
  };

  return (
    <img
      src={logoImg}
      alt="Cinematique Cinema"
      draggable={false}
      className={cn('inline-block select-none object-contain', imageSizes[size], className)}
    />
  );
};
