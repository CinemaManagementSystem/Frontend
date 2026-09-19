import React from 'react';

export const ShowtimeSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl p-5 shadow-xl flex flex-col md:flex-row gap-6 animate-pulse"
        >
          {/* Poster Skeleton */}
          <div className="w-full md:w-44 shrink-0 bg-muted rounded-xl aspect-[2/3]" />

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
