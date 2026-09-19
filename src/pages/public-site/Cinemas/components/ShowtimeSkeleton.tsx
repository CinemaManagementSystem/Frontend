import React from 'react';

export const ShowtimeSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" role="status" aria-label="Loading screenings">
      <span className="sr-only">Loading screenings…</span>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex gap-4 sm:gap-5 motion-safe:animate-pulse"
        >
          {/* Poster Skeleton */}
          <div className="w-[76px] sm:w-[120px] self-start shrink-0 bg-muted rounded-lg aspect-[2/3]" />

          {/* Details Skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-muted rounded-md w-3/4" />
            <div className="h-4 bg-muted rounded-md w-1/3" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-muted rounded-md w-full" />
              <div className="h-3 bg-muted rounded-md w-5/6" />
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="h-4 bg-muted rounded-md w-1/4" />
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="w-24 h-14 bg-muted rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
