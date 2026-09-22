import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Clock3, Filter, MapPin, Navigation, Phone, RefreshCw, Search, Ticket, X } from 'lucide-react';
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
import cinemaBanner from '@/assets/banner-cinema/cinema_banner.png';

function dateLabel(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export const CinemasPage = () => {
  const { movies, showtimes, loading, fetchCatalog, catalogRequiresSignIn } = useMovieStore();
  const { cinemas, selectedCinemaId, selectCinema, fetchCinemas, loading: cinemasLoading, error: cinemaError, locationError } = useCinemaStore();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const clock = useShowtimeClock();
  const [recheckTime, setRecheckTime] = useState(0);
  const now = Math.max(clock, recheckTime);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('ALL');
  const [cinemaSearch, setCinemaSearch] = useState('');
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
  const visibleCinemas = useMemo(() => {
    const query = cinemaSearch.trim().toLowerCase();
    if (!query) return cinemas;
    return cinemas.filter((cinema) => `${cinema.name} ${cinema.address} ${cinema.locationName} ${cinema.city}`.toLowerCase().includes(query));
  }, [cinemaSearch, cinemas]);
  const activeFiltersCount = Number(selectedFormat !== 'ALL') + Number(selectedTimeFilter !== 'ALL') + Number(Boolean(search));
  const clearFilters = () => { setSelectedFormat('ALL'); setSelectedTimeFilter('ALL'); setSearch(''); };
  const chooseCinema = (id: string) => {
    selectCinema(id);
    setParams((previous) => { const next = new URLSearchParams(previous); next.set('cinema', id); return next; }, { replace: true });
    setSelectedDate(''); setSelectedFormat('ALL');
  };
  const openCinema = (id: string) => {
    selectCinema(id);
    navigate(`/cinemas/${encodeURIComponent(id)}`);
  };
  const retry = () => { void loadCatalog(); void fetchCinemas(true); };
  const busy = loading || !catalogLoaded || cinemasLoading;
  const filters = <ShowtimeFilters selectedFormat={selectedFormat} selectedTimeFilter={selectedTimeFilter} onSelectFormat={setSelectedFormat} onSelectTimeFilter={setSelectedTimeFilter} onClearFilters={clearFilters} availableFormats={formatOptions} />;

  return (
    <div className="min-h-screen pb-20 text-foreground">
      <section className="relative isolate overflow-hidden py-8 sm:py-10 lg:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 scale-125 bg-cover bg-center opacity-45 blur-3xl"
          style={{ backgroundImage: `url(${cinemaBanner})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/20 via-background/45 to-background" aria-hidden="true" />
        <div className="container-main">
          <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.48)]">
            <img
              src={cinemaBanner}
              alt="Legend Cinema locations"
              className="block aspect-[2.208/1] h-auto w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container-main py-8 sm:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-black text-foreground sm:text-4xl">Cinema:</h1>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => chooseCinema('ALL')} aria-pressed={selectedCinemaId === 'ALL'} className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${selectedCinemaId === 'ALL' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground'}`}>All cinemas</button>
                <button type="button" onClick={retry} disabled={busy} aria-label="Refresh cinema listings" title="Refresh cinema listings" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-[var(--primary)]/60 hover:text-foreground disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /></button>
              </div>
            </div>
            <label className="relative mt-7 block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input aria-label="Search cinema locations" placeholder="Search location..." value={cinemaSearch} onChange={(event) => setCinemaSearch(event.target.value)} className="w-full rounded-lg border border-border bg-card/75 py-3.5 pl-11 pr-11 text-sm text-foreground shadow-sm outline-none transition focus:border-[var(--primary)]/70 focus:ring-2 focus:ring-[var(--primary)]/20" />
              {cinemaSearch && <button type="button" onClick={() => setCinemaSearch('')} aria-label="Clear cinema search" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
            </label>
            {cinemaError ? <div role="alert" className="mt-5 rounded-xl border border-red-500/30 p-4 text-sm"><p>{cinemaError}</p><button type="button" onClick={() => void fetchCinemas(true)} className="mt-2 font-semibold text-[var(--primary)] underline">Retry locations</button></div> : cinemasLoading && !cinemas.length ? <p role="status" className="py-8 text-sm text-muted-foreground">Loading cinema locations...</p> : !cinemas.length ? <p className="py-8 text-sm text-muted-foreground">Cinema locations will appear here when they are available.</p> : !visibleCinemas.length ? <div className="mt-5 rounded-lg border border-border bg-card/50 px-5 py-8 text-center"><p className="font-semibold text-foreground">No cinema matches &quot;{cinemaSearch.trim()}&quot;</p><button type="button" onClick={() => setCinemaSearch('')} className="mt-2 text-sm font-semibold text-[var(--primary)]">Clear search</button></div> : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cinema locations">
                {visibleCinemas.map((cinema, index) => {
                  const selected = selectedCinemaId === cinema.id;
                  const count = upcoming.filter((show) => show.cinemaId === cinema.id).length;
                  return <button type="button" key={cinema.id} onClick={() => openCinema(cinema.id)} aria-pressed={selected} className={`group relative overflow-hidden rounded-lg border bg-card text-left shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${selected ? 'border-[var(--primary)] shadow-[0_0_0_1px_rgba(225,29,46,.3)]' : 'border-border hover:-translate-y-0.5 hover:border-[var(--primary)]/55 hover:shadow-lg'}`}>
                    <span className="relative block aspect-[16/10] overflow-hidden bg-black">
                      <img src={cinemaBanner} alt="" aria-hidden="true" className="h-full w-full scale-125 object-cover transition duration-500 group-hover:scale-[1.3]" style={{ objectPosition: `${18 + (index % 5) * 16}% 72%` }} />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/5" aria-hidden="true" />
                      <span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90">{cinema.city || cinema.locationName || 'Cinema'}</span>
                      {selected && <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white"><Check className="h-4 w-4" /></span>}
                    </span>
                    <span className="block p-3.5">
                      <span className="block font-bold text-foreground">{cinema.name}</span>
                      <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />{cinema.address || 'Address not listed'}</span>
                      <span className="mt-3 block border-t border-border pt-2.5 text-[11px] text-muted-foreground">{cinema.status.toUpperCase() !== 'OPEN' ? 'Currently closed' : catalogRequiresSignIn ? 'View cinema details' : `${count} upcoming ${count === 1 ? 'screening' : 'screenings'}`}</span>
                    </span>
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
            {busy ? <ShowtimeSkeleton /> : fetchError ? <ShowtimeEmptyState type="ERROR" cinemaName={selectedCinema?.name || 'all cinemas'} selectedDate={activeDate} errorMessage={fetchError} onResetFilters={clearFilters} onRetry={retry} /> : catalogRequiresSignIn ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center text-card-foreground"><Ticket className="mx-auto mb-4 h-8 w-8 text-[var(--primary)]" /><h3 className="text-xl font-bold">Sign in to see available screenings</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Explore our cinema locations above, then sign in to choose your screen and seats.</p><Link to={`/login?redirect=${encodeURIComponent(`/cinemas?cinema=${selectedCinemaId}`)}`} className="mt-6 inline-flex rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white">Sign in to continue</Link></div>
            ) : filteredShows.length ? <><p role="status" className="mb-3 text-xs text-muted-foreground">{Object.keys(showtimesByMovie).length} {Object.keys(showtimesByMovie).length === 1 ? 'movie' : 'movies'} · {filteredShows.length} {filteredShows.length === 1 ? 'screening' : 'screenings'}</p><ShowtimeResults showtimesByMovie={showtimesByMovie} movies={movies} showCinemaName={selectedCinemaId === 'ALL'} onShowtimeExpired={() => setRecheckTime(Date.now())} /></> : <ShowtimeEmptyState type={dateShows.length ? 'FILTER_EMPTY' : 'NO_SHOWTIMES'} cinemaName={selectedCinema?.name || 'all cinemas'} selectedDate={activeDate} tomorrowDateStr={nextDate} onResetFilters={clearFilters} onSelectTomorrow={(date) => { setSelectedDate(date); clearFilters(); }} onShowAllCinemas={selectedCinemaId === 'ALL' ? undefined : () => chooseCinema('ALL')} />}
          </div>
        </div>
      </section>
    </div>
  );
};
