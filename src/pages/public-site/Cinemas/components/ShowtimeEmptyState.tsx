import { AlertCircle, Calendar, RefreshCw, FilterX, ArrowRight } from 'lucide-react';

interface ShowtimeEmptyStateProps {
  type: 'FILTER_EMPTY' | 'NO_SHOWTIMES' | 'ERROR';
  cinemaName: string;
  selectedDate: string;
  errorMessage?: string;
  tomorrowDateStr?: string;
  onResetFilters: () => void;
  onSelectTomorrow?: (date: string) => void;
  onRetry?: () => void;
  onShowAllCinemas?: () => void;
}

export const ShowtimeEmptyState = ({ type, cinemaName, selectedDate, errorMessage, tomorrowDateStr, onResetFilters, onSelectTomorrow, onRetry, onShowAllCinemas }: ShowtimeEmptyStateProps) => {
  const formatDay = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
  const Icon = type === 'ERROR' ? AlertCircle : type === 'FILTER_EMPTY' ? FilterX : Calendar;
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center text-card-foreground" role={type === 'ERROR' ? 'alert' : 'status'}>
      <Icon className="mx-auto mb-4 h-9 w-9 text-[var(--primary)]" />
      <h3 className="text-xl font-bold tracking-tight text-foreground">{type === 'ERROR' ? 'Screenings could not be loaded' : type === 'FILTER_EMPTY' ? 'No screenings match your search' : 'No upcoming screenings on this day'}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{type === 'ERROR' ? errorMessage || 'Please try refreshing the listings.' : type === 'FILTER_EMPTY' ? `Try a different movie, format, or time at ${cinemaName} on ${formatDay(selectedDate)}.` : `There are no bookable screenings at ${cinemaName} on ${formatDay(selectedDate)}. Choose another date or explore other cinemas.`}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {type === 'ERROR' && onRetry && <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" />Retry listings</button>}
        {type === 'FILTER_EMPTY' && <button type="button" onClick={onResetFilters} className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white">Clear search & filters</button>}
        {type === 'NO_SHOWTIMES' && tomorrowDateStr && onSelectTomorrow && <button type="button" onClick={() => onSelectTomorrow(tomorrowDateStr)} className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white">Next screening · {formatDay(tomorrowDateStr)}<ArrowRight className="h-4 w-4" /></button>}
        {type === 'NO_SHOWTIMES' && onShowAllCinemas && <button type="button" onClick={onShowAllCinemas} className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/10">Explore all cinemas</button>}
      </div>
    </div>
  );
};
