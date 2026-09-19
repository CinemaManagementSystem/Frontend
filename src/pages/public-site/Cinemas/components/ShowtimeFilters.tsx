import React from 'react';
import { Filter, X } from 'lucide-react';

export interface FilterOptions {
  format: string;
  timeFilter: string;
}

interface ShowtimeFiltersProps {
  selectedFormat: string;
  selectedTimeFilter: string;
  onSelectFormat: (format: string) => void;
  onSelectTimeFilter: (timeFilter: string) => void;
  onClearFilters: () => void;
}

export const FORMAT_OPTIONS = [
  { id: 'ALL', label: 'All Formats' },
  { id: 'IMAX', label: 'IMAX 3D Laser' },
  { id: 'DOLBY', label: 'Dolby Atmos' },
  { id: 'VIP', label: 'VIP Director Suite' },
  { id: '3D', label: 'Standard 3D' },
  { id: '2D', label: 'Standard Digital' },
];

export const TIME_OPTIONS = [
  { id: 'ALL', label: 'All Showtimes' },
  { id: 'MORNING', label: 'Morning (Before 12:00 PM)' },
  { id: 'AFTERNOON', label: 'Afternoon (12:00 PM - 5:00 PM)' },
  { id: 'EVENING', label: 'Evening (After 5:00 PM)' },
];

export const ShowtimeFilters: React.FC<ShowtimeFiltersProps> = ({
  selectedFormat,
  selectedTimeFilter,
  onSelectFormat,
  onSelectTimeFilter,
  onClearFilters,
}) => {
  const activeCount = (selectedFormat !== 'ALL' ? 1 : 0) + (selectedTimeFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6 shadow-xl sticky top-40">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#E50914]" />
          <span>Filter Showtimes</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </h3>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-[#E50914] hover:underline uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E50914] rounded"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Format Filter */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
          Format
        </span>
        <div className="flex flex-col gap-1.5">
          {FORMAT_OPTIONS.map((fmt) => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onSelectFormat(fmt.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${
                  isSelected
                    ? 'bg-[#E50914] text-white border-transparent shadow-md shadow-[#E50914]/20 font-bold'
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                }`}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showtime Time Filter */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
          Showtime Time
        </span>
        <div className="flex flex-col gap-1.5">
          {TIME_OPTIONS.map((t) => {
            const isSelected = selectedTimeFilter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTimeFilter(t.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${
                  isSelected
                    ? 'bg-[#E50914] text-white border-transparent shadow-md shadow-[#E50914]/20 font-bold'
                    : 'bg-muted/50 border-border/60 text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
