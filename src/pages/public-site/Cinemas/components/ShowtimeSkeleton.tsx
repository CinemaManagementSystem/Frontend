import React from 'react';

export const ShowtimeSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" role="status" aria-label="Loading screenings">
      <span className="sr-only">Loading screenings…</span>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="skeleton rounded-2xl border border-white/10 p-4 sm:p-5"
        >
          <div className="flex gap-4 sm:gap-5">
            <div className="skeleton w-[76px] sm:w-[120px] self-start shrink-0 rounded-lg aspect-[2/3]" />
            <div className="flex-1 space-y-4">
              <div className="skeleton h-6 w-3/4 rounded-md" />
              <div className="skeleton h-4 w-1/3 rounded-md" />
              <div className="space-y-2 pt-2">
                <div className="skeleton h-3 w-full rounded-md" />
                <div className="skeleton h-3 w-5/6 rounded-md" />
              </div>
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="skeleton h-4 w-1/4 rounded-md" />
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="skeleton h-10 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};