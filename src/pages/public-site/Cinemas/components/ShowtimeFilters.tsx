import React from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  availableFormats?: string[];
}

const FORMAT_OPTIONS = [
  { id: 'ALL', label: 'All Formats' },
  { id: 'IMAX', label: 'IMAX' },
  { id: 'DOLBY', label: 'Dolby Atmos' },
  { id: 'VIP', label: 'VIP' },
  { id: '3D', label: '3D' },
  { id: '4DX', label: '4DX' },
  { id: '2D', label: '2D' },
];

const TIME_OPTIONS = [
  { id: 'ALL', label: 'All Showtimes' },
  { id: 'MORNING', label: 'Morning (Before 12:00 PM)' },
  { id: 'AFTERNOON', label: 'Afternoon (12:00 PM - 5:00 PM)' },
  { id: 'EVENING', label: 'Evening (5:00 PM onward)' },
];

export const ShowtimeFilters: React.FC<ShowtimeFiltersProps> = ({
  selectedFormat,
  selectedTimeFilter,
  onSelectFormat,
  onSelectTimeFilter,
  onClearFilters,
  availableFormats,
}) => {
  const activeCount = (selectedFormat !== 'ALL' ? 1 : 0) + (selectedTimeFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--primary)]" />
          <span>Filter Showtimes</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </h3>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] hover:underline uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] rounded"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block">
          Format
        </span>
        <div className="flex flex-col gap-1.5">
          {FORMAT_OPTIONS.filter((fmt) => fmt.id === 'ALL' || !availableFormats || availableFormats.includes(fmt.id) || selectedFormat === fmt.id).map((fmt) => {
            const isSelected = selectedFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onSelectFormat(fmt.id)}
                aria-pressed={isSelected}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
                  isSelected
                    ? 'bg-[var(--primary)] text-white border-transparent shadow-md shadow-[var(--primary)]/20 font-bold'
                    : 'bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/5 hover:border-white/25 hover:text-white'
                )}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block">
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
                aria-pressed={isSelected}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
                  isSelected
                    ? 'bg-[var(--primary)] text-white border-transparent shadow-md shadow-[var(--primary)]/20 font-bold'
                    : 'bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/5 hover:border-white/25 hover:text-white'
                )}
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
