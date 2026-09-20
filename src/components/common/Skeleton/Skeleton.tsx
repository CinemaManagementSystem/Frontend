import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={cn('skeleton rounded-lg', className)} aria-hidden="true" />
);

export const PosterSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('skeleton aspect-[2/3] w-full rounded-lg', className)} aria-hidden="true" />
);

export const BannerSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={cn('skeleton aspect-[16/7] w-full rounded-2xl', className)} aria-hidden="true" />
);

export const DateCardSkeleton: React.FC = () => (
  <div className="skeleton min-w-[72px] flex-shrink-0 rounded-xl h-24" aria-hidden="true" />
);

export const MovieCardSkeleton: React.FC = () => (
  <article className="group min-w-0" aria-hidden="true">
    <PosterSkeleton />
    <div className="mt-3 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  </article>
);

export const ShowtimeSkeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden="true" role="status" aria-label="Loading showtimes">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4">
        <div className="skeleton h-6 w-48 rounded mb-4" />
        <div className="skeleton h-8 w-full rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="skeleton h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <section className="relative isolate overflow-hidden border-b border-white/10" aria-hidden="true">
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
    <div className="container-main">
      <div className="w-full">
        <BannerSkeleton />
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={i === 0 ? 'carousel-dot carousel-dot-active' : 'carousel-dot carousel-dot-inactive'} />
          ))}
        </div>
      </div>
    </div>
  </section>
);
