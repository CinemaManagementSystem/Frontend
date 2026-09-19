import React from 'react';
import { AlertCircle, Calendar, RefreshCw, FilterX } from 'lucide-react';

interface ShowtimeEmptyStateProps {
  type: 'FILTER_EMPTY' | 'NO_SHOWTIMES' | 'ERROR';
  cinemaName: string;
  selectedDate: string;
  errorMessage?: string;
  tomorrowDateStr?: string;
  onResetFilters: () => void;
  onSelectTomorrow?: (tomorrowDateStr: string) => void;
  onRetry?: () => void;
}

export const ShowtimeEmptyState: React.FC<ShowtimeEmptyStateProps> = ({
  type,
  cinemaName,
  selectedDate,
  errorMessage,
  tomorrowDateStr,
  onResetFilters,
  onSelectTomorrow,
  onRetry,
}) => {
  if (type === 'ERROR') {
    return (
      <div className="py-16 px-6 text-center bg-card border border-border/80 rounded-3xl p-8 space-y-4 shadow-xl">
        <AlertCircle className="w-12 h-12 text-[#E50914] mx-auto animate-bounce" />
        <h3 className="text-lg font-black text-foreground uppercase tracking-wider">
          We Couldn't Load Showtimes
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          {errorMessage || 'There was an issue connecting to the server. Please check your connection and try again.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E50914]/90 transition-all cursor-pointer shadow-md shadow-[#E50914]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'FILTER_EMPTY') {
    return (
      <div className="py-16 px-6 text-center bg-card border border-border/80 rounded-3xl p-8 space-y-4 shadow-xl">
        <FilterX className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-black text-foreground uppercase tracking-wider">
          No Showtimes Match Your Filters
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          No showtimes found at <span className="text-foreground font-bold">{cinemaName}</span> on{' '}
          <span className="text-foreground font-bold">{selectedDate}</span> matching your selected format or time filters.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E50914]/90 transition-all cursor-pointer shadow-md shadow-[#E50914]/20"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 text-center bg-card border border-border/80 rounded-3xl p-8 space-y-4 shadow-xl">
      <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
      <h3 className="text-lg font-black text-foreground uppercase tracking-wider">
        No Showtimes Available
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
        There are no scheduled showtimes at <span className="text-foreground font-bold">{cinemaName}</span> on{' '}
        <span className="text-foreground font-bold">{selectedDate}</span>.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {tomorrowDateStr && onSelectTomorrow && (
          <button
            type="button"
            onClick={() => onSelectTomorrow(tomorrowDateStr)}
            className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#E50914]/90 transition-all cursor-pointer shadow-md shadow-[#E50914]/20"
          >
            Check Tomorrow
          </button>
        )}
        <button
          type="button"
          onClick={onResetFilters}
          className="px-5 py-2.5 rounded-xl bg-muted text-foreground hover:bg-muted/80 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
