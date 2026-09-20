import React from 'react';

import { cn } from '@/lib/utils';
import logoImg from '@/assets/legend-cinema-logo.svg';

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
    md: 'h-9 w-auto',
    lg: 'h-11 w-auto',
  };

  return (
    <img
      src={logoImg}
      alt="Legend Cinema"
      draggable={false}
      className={cn('inline-block select-none object-contain', imageSizes[size], className)}
    />
  );
};
