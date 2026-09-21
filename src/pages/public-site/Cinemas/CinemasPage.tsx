import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Building2, Check, Clock3, Filter, MapPin, Navigation, Phone, RefreshCw, Search, Ticket, X } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';
import { getApiErrorMessage } from '@/services/apiClient';
import { getCinemaDate, isUpcomingShowtime } from '@/lib/showtime';
import { DateSelector, type DateItem } from './components/DateSelector';
import { ShowtimeFilters } from './components/ShowtimeFilters';
import { ShowtimeResults } from './components/ShowtimeResults';
import { ShowtimeSkeleton } from './components/ShowtimeSkeleton';
import { ShowtimeEmptyState } from './components/ShowtimeEmptyState';
import type { Showtime } from '@/types/movie';

function dateLabel(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export const CinemasPage = () => {
  const { movies, showtimes, loading, fetchCatalog } = useMovieStore();
  const { cinemas, selectedCinemaId, selectCinema, fetchCinemas, loading: cinemasLoading, error: cinemaError, locationError } = useCinemaStore();
  const [params, setParams] = useSearchParams();
  const clock = useShowtimeClock();
  const [recheckTime, setRecheckTime] = useState(0);
  const now = Math.max(clock, recheckTime);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const cinemaQuery = params.get('cinema');
  const today = getCinemaDate(now);
  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);

  const loadCatalog = useCallback(async () => {
    setFetchError(null);
    try { await fetchCatalog(); }
    catch (error) { setFetchError(getApiErrorMessage(error, 'showtimes')); }
    finally { setCatalogLoaded(true); }
  }, [fetchCatalog]);

  useEffect(() => { void loadCatalog(); void fetchCinemas(); }, [loadCatalog, fetchCinemas]);
  useEffect(() => {
    if (cinemaQuery === 'ALL' || cinemas.some((cinema) => cinema.id === cinemaQuery)) selectCinema(cinemaQuery!);
  }, [cinemaQuery, cinemas, selectCinema]);
  useEffect(() => {
    setSelectedDate('');
    setSelectedFormat('ALL');
  }, [selectedCinemaId]);

  const upcoming = useMemo(() => showtimes.filter((show) => {
    const cinema = cinemas.find((item) => item.id === show.cinemaId);
    return isUpcomingShowtime(show, now) && cinema?.status.toUpperCase() === 'OPEN';
  }).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)), [showtimes, cinemas, now]);
  const cinemaShows = upcoming.filter((show) => selectedCinemaId === 'ALL' || show.cinemaId === selectedCinemaId);
  const activeDate = selectedDate && selectedDate >= today ? selectedDate : cinemaShows[0]?.date || today;
  const availableDates = [...new Set(cinemaShows.map((show) => show.date))];
  const dateList: DateItem[] = [...new Set([
    ...Array.from({ length: 7 }, (_, index) => {
      const day = new Date(`${today}T12:00:00Z`);
      day.setUTCDate(day.getUTCDate() + index);
      return day.toISOString().slice(0, 10);
    }),
    ...availableDates,
  ])].sort().map((date) => ({
    dateStr: date, dayName: dateLabel(date, { weekday: 'short' }), dayNum: dateLabel(date, { day: 'numeric' }),
    monthName: dateLabel(date, { month: 'short' }), isToday: date === today, hasShowtimes: availableDates.includes(date),
  }));
  const dateShows = cinemaShows.filter((show) => show.date === activeDate);
  const formatOptions = [...new Set(cinemaShows.map((show) => show.format.toUpperCase()))].sort();
  const filteredShows = dateShows.filter((show) => {
    if (selectedFormat !== 'ALL' && show.format.toUpperCase() !== selectedFormat) return false;
    const hour = Number(show.time.split(':')[0]);
    if (selectedTimeFilter === 'MORNING' && hour >= 12) return false;
    if (selectedTimeFilter === 'AFTERNOON' && (hour < 12 || hour >= 17)) return false;
    if (selectedTimeFilter === 'EVENING' && hour < 17) return false;
    const movie = movies.find((item) => item.id === show.movieId);
    return movie && `${movie.title} ${movie.genres.join(' ')}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const showtimesByMovie = filteredShows.reduce<Record<string, Showtime[]>>((groups, show) => {
    (groups[show.movieId] ??= []).push(show);
    return groups;
  }, {});
  const nextDate = availableDates.find((date) => date > activeDate);
  const activeFiltersCount = Number(selectedFormat !== 'ALL') + Number(selectedTimeFilter !== 'ALL') + Number(Boolean(search));
  const clearFilters = () => { setSelectedFormat('ALL'); setSelectedTimeFilter('ALL'); setSearch(''); };
  const chooseCinema = (id: string) => {
    selectCinema(id);
    setParams((previous) => { const next = new URLSearchParams(previous); next.set('cinema', id); return next; }, { replace: true });
    setSelectedDate(''); setSelectedFormat('ALL');
  };
  const retry = () => { void loadCatalog(); void fetchCinemas(true); };
  const busy = loading || !catalogLoaded || cinemasLoading;
  const filters = <ShowtimeFilters selectedFormat={selectedFormat} selectedTimeFilter={selectedTimeFilter} onSelectFormat={setSelectedFormat} onSelectTimeFilter={setSelectedTimeFilter} onClearFilters={clearFilters} availableFormats={formatOptions} />;

  return (
    <div className="min-h-screen pb-20 text-foreground">
      <section className="border-b border-border">
        <div className="container-main py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]"><Ticket className="h-4 w-4" /> Cinemas & showtimes</p>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Your next big-screen moment.</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Choose your cinema, find a screening, and make it a movie night.</p>
            </div>
            <button type="button" onClick={retry} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent/10 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} /> Refresh listings</button>
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4 text-[var(--primary)]" /> Choose a cinema <span className="font-normal text-muted-foreground">{cinemas.length > 0 && `(${cinemas.length})`}</span></h2>
            <button type="button" onClick={() => chooseCinema('ALL')} aria-pressed={selectedCinemaId === 'ALL'} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selectedCinemaId === 'ALL' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent/10'}`}>All cinemas</button>
          </div>
          {cinemaError ? <div role="alert" className="mt-4 rounded-xl border border-red-500/30 p-4 text-sm"><p>{cinemaError}</p><button type="button" onClick={() => void fetchCinemas(true)} className="mt-2 font-semibold text-[var(--primary)] underline">Retry locations</button></div> : cinemasLoading && !cinemas.length ? <p role="status" className="py-6 text-sm text-muted-foreground">Loading cinema locations…</p> : !cinemas.length ? <p className="py-6 text-sm text-muted-foreground">Cinema locations will appear here when they are available.</p> : (
            <div className="mt-3 grid gap-3 md:grid-cols-3" aria-label="Cinema locations">
              {cinemas.map((cinema) => {
                const selected = selectedCinemaId === cinema.id;
                const count = upcoming.filter((show) => show.cinemaId === cinema.id).length;
<<<<<<< Updated upstream
                return <button type="button" key={cinema.id} onClick={() => chooseCinema(cinema.id)} aria-pressed={selected} className={`relative flex flex-col rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${selected ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-white/10 bg-white/[0.02] hover:border-[var(--primary)]/50'}`}>
                  <span className="mb-3 flex w-full items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50"><span>{cinema.city || cinema.locationName || 'Cinema'}</span>{selected ? <Check className="h-4 w-4 text-[var(--primary)]" /> : <Building2 className="h-4 w-4" />}</span>
                  <span className="font-bold">{cinema.name}</span>
                  <span className="mt-1 text-xs leading-relaxed text-white/50">{cinema.address || 'Address not listed'}</span>
                  <span className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">{cinema.status.toUpperCase() !== 'OPEN' ? 'Currently closed' : `${count} upcoming ${count === 1 ? 'screening' : 'screenings'}`}</span>
=======
                return <button type="button" key={cinema.id} onClick={() => chooseCinema(cinema.id)} aria-pressed={selected} className={`relative flex flex-col rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${selected ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-foreground' : 'border-border bg-card/60 hover:border-[var(--primary)]/50'}`}>
                  <span className="mb-3 flex w-full items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"><span>{cinema.city || cinema.locationName || 'Cinema'}</span>{selected ? <Check className="h-4 w-4 text-[var(--primary)]" /> : <Building2 className="h-4 w-4" />}</span>
                  <span className="font-bold text-foreground">{cinema.name}</span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{cinema.address || 'Address not listed'}</span>
                  <span className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">{cinema.status.toUpperCase() !== 'OPEN' ? 'Currently closed' : catalogRequiresSignIn ? 'View cinema details' : `${count} upcoming ${count === 1 ? 'screening' : 'screenings'}`}</span>
>>>>>>> Stashed changes
                </button>;
              })}
            </div>
          )}
          {locationError && <p role="status" className="mt-3 text-xs text-muted-foreground">Map details are temporarily unavailable. <button onClick={() => void fetchCinemas(true)} className="underline">Retry</button></p>}
          {selectedCinema && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-4 w-4 shrink-0 text-[var(--primary)]" />{selectedCinema.address || selectedCinema.locationName || selectedCinema.name}</p>
            <div className="flex items-center gap-5 text-xs font-semibold">
              {selectedCinema.phone && <a href={`tel:${selectedCinema.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><Phone className="h-3.5 w-3.5" />{selectedCinema.phone}</a>}
              {selectedCinema.googleMapsUrl && <a href={selectedCinema.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[var(--primary)]"><Navigation className="h-3.5 w-3.5" />Directions<ArrowUpRight className="h-3.5 w-3.5" /></a>}
            </div>
          </div>}
        </div>
      </section>
      <DateSelector dateList={dateList} selectedDate={activeDate} onSelectDate={setSelectedDate} />
      <section className="container-main mt-7">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 className="text-xl font-bold tracking-tight text-foreground">{activeDate === today ? 'Today' : dateLabel(activeDate, { weekday: 'long', month: 'short', day: 'numeric' })}<span className="ml-2 text-sm font-normal text-muted-foreground">at {selectedCinema?.name || 'all cinemas'}</span></h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Cambodia time (UTC+7) · Upcoming screenings only</p></div>
          <label className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Search movies or genres" placeholder="Search movies or genres" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear movie search" className="absolute right-3 top-3 text-muted-foreground"><X className="h-4 w-4" /></button>}</label>
        </div>
        <button type="button" onClick={() => setMobileFilterOpen(!mobileFilterOpen)} aria-expanded={mobileFilterOpen} aria-controls="mobile-showtime-filters" className="mb-4 flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground lg:hidden"><span className="flex items-center gap-2"><Filter className="h-4 w-4 text-[var(--primary)]" />Format & time{activeFiltersCount > 0 && ` (${activeFiltersCount})`}</span><span>{mobileFilterOpen ? 'Hide' : 'Show'}</span></button>
        {mobileFilterOpen && <div id="mobile-showtime-filters" className="mb-5 lg:hidden">{filters}</div>}
        <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">{filters}<p className="px-2 pt-4 text-xs leading-relaxed text-muted-foreground">Pick a time to view the seat map. Seat availability is confirmed when you book.</p><Link to="/promotion" className="mt-5 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-xs font-semibold text-foreground hover:border-[var(--primary)]">Plan your snacks<ArrowUpRight className="h-4 w-4 text-[var(--primary)]" /></Link></aside>
          <div className="min-w-0">
<<<<<<< Updated upstream
            {busy ? <ShowtimeSkeleton /> : fetchError ? <ShowtimeEmptyState type="ERROR" cinemaName={selectedCinema?.name || 'all cinemas'} selectedDate={activeDate} errorMessage={fetchError} onResetFilters={clearFilters} onRetry={retry} /> : filteredShows.length ? <><p role="status" className="mb-3 text-xs text-white/50">{Object.keys(showtimesByMovie).length} {Object.keys(showtimesByMovie).length === 1 ? 'movie' : 'movies'} · {filteredShows.length} {filteredShows.length === 1 ? 'screening' : 'screenings'}</p><ShowtimeResults showtimesByMovie={showtimesByMovie} movies={movies} showCinemaName={selectedCinemaId === 'ALL'} onShowtimeExpired={() => setRecheckTime(Date.now())} /></> : <ShowtimeEmptyState type={dateShows.length ? 'FILTER_EMPTY' : 'NO_SHOWTIMES'} cinemaName={selectedCinema?.name || 'all cinemas'} selectedDate={activeDate} tomorrowDateStr={nextDate} onResetFilters={clearFilters} onSelectTomorrow={(date) => { setSelectedDate(date); clearFilters(); }} onShowAllCinemas={selectedCinemaId === 'ALL' ? undefined : () => chooseCinema('ALL')} />}
=======
            {busy ? <ShowtimeSkeleton /> : fetchError ? <ShowtimeEmptyState type="ERROR" cinemaName={selectedCinema?.name || 'all cinemas'} selectedDate={activeDate} errorMessage={fetchError} onResetFilters={clearFilters} onRetry={retry} /> : catalogRequiresSignIn ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center text-card-foreground"><Ticket className="mx-auto mb-4 h-8 w-8 text-[var(--primary)]" /><h3 className="text-xl font-bold">Sign in to see available screenings</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Explore our cinema locations above, then sign in to choose your screen and seats.</p><Link to={`/login?redirect=${encodeURIComponent(`/cinemas?cinema=${selectedCinemaId}`)}`} className="mt-6 inline-flex rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white">Sign in to continue</Link></div>
            ) : filteredShows.length ? <><p role="status" className="mb-3 text-xs text-muted-foreground">{Object.keys(showtimesByMovie).length} {Object.keys(showtimesByMovie).length === 1 ? 'movie' : 'movies'} · {filteredShows.length} {filteredShows.length === 1 ? 'screening' : 'screenings'}</p><ShowtimeResults showtimesByMovie={showtimesByMovie} movies={movies} showCinemaName={selectedCinemaId === 'ALL'} onShowtimeExpired={() => setRecheckTime(Date.now())} /></> : <ShowtimeEmptyState type={dateShows.length ? 'FILTER_EMPTY' : 'NO_SHOWTIMES'} cinemaName={selectedCinema?.name || 'all cinemas'} selectedDate={activeDate} tomorrowDateStr={nextDate} onResetFilters={clearFilters} onSelectTomorrow={(date) => { setSelectedDate(date); clearFilters(); }} onShowAllCinemas={selectedCinemaId === 'ALL' ? undefined : () => chooseCinema('ALL')} />}
>>>>>>> Stashed changes
          </div>
        </div>
      </section>
    </div>
  );
};
