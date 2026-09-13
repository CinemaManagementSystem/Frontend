import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { getAvatarSrc } from '@/lib/avatar';

interface AvatarProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <img
      src={hasError ? getAvatarSrc(null) : getAvatarSrc(src)}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('aspect-square rounded-full object-cover', className)}
    />
  );
};
