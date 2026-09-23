import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  BANNER_ASPECT_RATIO,
  BANNER_MAX_WIDTH_PX,
  BANNER_RADIUS_PX,
} from './bannerLayout';

interface BannerFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: number | string;
  shadow?: boolean;
}

export const BannerFrame = forwardRef<HTMLDivElement, BannerFrameProps>(function BannerFrame({
  children,
  className,
  maxWidth = BANNER_MAX_WIDTH_PX,
  shadow = true,
  style,
  ...props
}, ref) {
  const frameStyle: CSSProperties = {
    aspectRatio: BANNER_ASPECT_RATIO,
    maxWidth,
    width: '100%',
    overflow: 'hidden',
    borderRadius: BANNER_RADIUS_PX,
    ...style,
  };

  return (
    <div
      className={cn(
        'relative bg-white/10',
        shadow && 'shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
        className,
      )}
      ref={ref}
      style={frameStyle}
      {...props}
    >
      {children}
    </div>
  );
});
