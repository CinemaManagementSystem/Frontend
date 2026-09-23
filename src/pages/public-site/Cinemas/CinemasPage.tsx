import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  Film,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  Tv,
  Volume2,
  X,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';
import { isUpcomingShowtime } from '@/lib/showtime';
import { BannerCarousel } from '@/components/common/BannerCarousel';
import { getApiErrorMessage } from '@/services/apiClient';

export const CinemasPage = () => {
  const { showtimes, loading, fetchCatalog, catalogRequiresSignIn } = useMovieStore();
  const {
    cinemas,
    selectedCinemaId,
    selectCinema,
    fetchCinemas,
    loading: cinemasLoading,
    error: cinemaError,
    locationError,
  } = useCinemaStore();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const clock = useShowtimeClock();

  const [cinemaSearch, setCinemaSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const cinemaQuery = params.get('cinema');
  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);

  const loadCatalog = useCallback(async () => {
    setCatalogError('');
    try {
      await fetchCatalog();
    } catch (error) {
      setCatalogError(getApiErrorMessage(error, 'movie catalogue'));
    } finally {
      setCatalogLoaded(true);
    }
  }, [fetchCatalog]);

  useEffect(() => {
    void loadCatalog();
    void fetchCinemas();
  }, [loadCatalog, fetchCinemas]);

  useEffect(() => {
    if (cinemaQuery === 'ALL' || cinemas.some((cinema) => cinema.id === cinemaQuery)) {
      selectCinema(cinemaQuery!);
    }
  }, [cinemaQuery, cinemas, selectCinema]);

  // Extract distinct cities for quick filters
  const cities = useMemo(() => {
    const set = new Set<string>();
    cinemas.forEach((c) => {
      const city = c.city || c.locationName;
      if (city) set.add(city);
    });
    return Array.from(set).sort();
  }, [cinemas]);

  const upcoming = useMemo(
    () =>
      showtimes.filter((show) => {
        const cinema = cinemas.find((item) => item.id === show.cinemaId);
        return isUpcomingShowtime(show, clock) && cinema?.status.toUpperCase() === 'OPEN';
      }),
    [showtimes, cinemas, clock]
  );

  const visibleCinemas = useMemo(() => {
    let list = cinemas;
    if (selectedCity !== 'ALL') {
      list = list.filter((c) => (c.city || c.locationName) === selectedCity);
    }
    const query = cinemaSearch.trim().toLowerCase();
    if (!query) return list;
    return list.filter((cinema) =>
      `${cinema.name} ${cinema.address} ${cinema.locationName} ${cinema.city}`
        .toLowerCase()
        .includes(query)
    );
  }, [cinemaSearch, selectedCity, cinemas]);

  const chooseCinema = (id: string) => {
    selectCinema(id);
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set('cinema', id);
        return next;
      },
      { replace: true }
    );
  };

  const openCinema = (id: string) => {
    selectCinema(id);
    navigate(`/cinemas/${encodeURIComponent(id)}`);
  };

  const retry = () => {
    void loadCatalog();
    void fetchCinemas(true);
  };

  const busy = loading || !catalogLoaded || cinemasLoading;

  return (
    <div className="min-h-screen pb-24 text-foreground">
      {/* ─── HERO BANNER SECTION ───────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-6 pb-10 sm:pt-8 sm:pb-14">
        {/* Atmospheric Glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-gradient-to-b from-primary-950/20 via-neutral-950 to-background opacity-60 blur-3xl"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background"
          aria-hidden="true"
        />

        <div className="container-main">
          {/* Main Hero Card */}
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-md">
            <BannerCarousel
              section="CINEMA"
              heightClass="aspect-[21/9] sm:aspect-[2.4/1] w-full min-h-[300px]"
              roundedClass="rounded-none"
              showCaptions={true}
            />

            {/* Quick Experience Badges Bar */}
            <div className="grid grid-cols-2 divide-x divide-y sm:divide-y-0 sm:grid-cols-4 divide-white/10 border-t border-white/10 bg-zinc-900/60 p-3 sm:p-4 text-xs font-medium text-zinc-300">
              <div className="flex items-center justify-center gap-2 py-2 px-3">
                <Tv className="h-4 w-4 text-[var(--primary)]" />
                <span>IMAX &amp; Laser 4K</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-3">
                <Volume2 className="h-4 w-4 text-[var(--primary)]" />
                <span>Dolby Atmos Sound</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-3">
                <Building2 className="h-4 w-4 text-[var(--primary)]" />
                <span>VIP &amp; Premiere Lounges</span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 px-3">
                <Film className="h-4 w-4 text-[var(--primary)]" />
                <span>Online Reserved Seating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CINEMA DISCOVERY & LOCATIONS SECTION ───────────────────── */}
      <section className="container-main">
        <div className="mx-auto max-w-6xl">
          {/* Header Row: Title, City Pills, Search & Refresh */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]" />
                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Explore Locations
                </h2>
                <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {cinemas.length} {cinemas.length === 1 ? 'Cinema' : 'Cinemas'}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a cinema to view today&apos;s showtimes, hall formats, and seat availability.
              </p>
            </div>

            {/* Controls: Search + Refresh */}
            <div className="flex items-center gap-3">
              <label className="relative flex-1 sm:w-80">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  aria-label="Search cinema locations"
                  placeholder="Search cinema or address..."
                  value={cinemaSearch}
                  onChange={(event) => setCinemaSearch(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 py-2.5 pl-10 pr-9 text-sm text-foreground shadow-sm backdrop-blur-sm outline-none transition focus:border-[var(--primary)]/70 focus:ring-2 focus:ring-[var(--primary)]/20 placeholder:text-muted-foreground"
                />
                {cinemaSearch && (
                  <button
                    type="button"
                    onClick={() => setCinemaSearch('')}
                    aria-label="Clear cinema search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>

              <button
                type="button"
                onClick={retry}
                disabled={busy}
                aria-label="Refresh cinema listings"
                title="Refresh cinema listings"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground transition hover:border-[var(--primary)]/60 hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* City Filter Tabs */}
          {cities.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedCity('ALL');
                  chooseCinema('ALL');
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedCity === 'ALL'
                    ? 'bg-[var(--primary)] text-white shadow-md shadow-red-500/20'
                    : 'border border-border bg-card/70 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                All Cities ({cinemas.length})
              </button>
              {cities.map((city) => {
                const count = cinemas.filter((c) => (c.city || c.locationName) === city).length;
                const active = selectedCity === city;
                return (
                  <button
                    type="button"
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-[var(--primary)] text-white shadow-md shadow-red-500/20'
                        : 'border border-border bg-card/70 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    {city} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {catalogError && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/15 p-3 text-sm font-medium text-rose-300"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Showtimes could not load.</p>
                <p className="mt-0.5 text-xs text-rose-200/80">{catalogError}</p>
              </div>
            </div>
          )}

          {/* Active Cinema Detail Banner */}
          {selectedCinema && (
            <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--primary)]/30 bg-gradient-to-r from-[var(--primary)]/10 via-card to-card p-4 sm:flex-row sm:items-center sm:p-5 shadow-lg">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                      Selected Cinema
                    </span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-foreground sm:text-xl">
                    {selectedCinema.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
                    {selectedCinema.address || selectedCinema.locationName || selectedCinema.city}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                {selectedCinema.phone && (
                  <a
                    href={`tel:${selectedCinema.phone.replace(/[^+\d]/g, '')}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {selectedCinema.phone}
                  </a>
                )}
                {selectedCinema.googleMapsUrl && (
                  <a
                    href={selectedCinema.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
                  >
                    <Navigation className="h-3.5 w-3.5 text-[var(--primary)]" />
                    Directions
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => openCinema(selectedCinema.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-500/25 transition hover:brightness-110"
                >
                  View Showtimes
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── CINEMA CARDS GRID ───────────────────────────────────── */}
          <div className="mt-8">
            {cinemaError ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center text-sm"
              >
                <p className="font-semibold text-red-400">{cinemaError}</p>
                <button
                  type="button"
                  onClick={() => void fetchCinemas(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry Locations
                </button>
              </div>
            ) : cinemasLoading && !cinemas.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 animate-pulse rounded-2xl border border-border bg-card/60"
                  />
                ))}
              </div>
            ) : !cinemas.length ? (
              <div className="rounded-2xl border border-border bg-card/50 px-6 py-16 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-base font-bold text-foreground">No cinemas found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cinema locations will appear here when they are available.
                </p>
              </div>
            ) : !visibleCinemas.length ? (
              <div className="rounded-2xl border border-border bg-card/50 px-6 py-16 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <p className="mt-4 text-base font-bold text-foreground">
                  No cinema matches &quot;{cinemaSearch.trim()}&quot;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try searching for another city, street, or cinema name.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCinemaSearch('');
                    setSelectedCity('ALL');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
                >
                  Clear search &amp; filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cinema locations">
                {visibleCinemas.map((cinema) => {
                  const selected = selectedCinemaId === cinema.id;
                  const count = upcoming.filter((show) => show.cinemaId === cinema.id).length;
                  const isOpen = cinema.status.toUpperCase() === 'OPEN';

                  return (
                    <button
                      type="button"
                      key={cinema.id}
                      onClick={() => openCinema(cinema.id)}
                      aria-pressed={selected}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#141010] p-3.5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                        selected
                          ? 'border-[var(--primary)] shadow-[0_0_0_1px_rgba(225,29,46,0.3)] shadow-red-500/10'
                          : 'border-white/5 hover:border-[var(--primary)]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
                      }`}
                    >
                      {/* Cinema Cover Aspect */}
                      <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-zinc-950">
                        {cinema.imageUrl ? (
                          <img
                            src={cinema.imageUrl}
                            alt={cinema.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-950 via-red-950/25 to-zinc-900 text-zinc-600">
                            <Building2 className="h-12 w-12" aria-hidden="true" />
                          </div>
                        )}
                        {/* Subtle Gradient Shadow */}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"
                          aria-hidden="true"
                        />

                        {/* Top Badges */}
                        <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
                          <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/95 backdrop-blur-md border border-white/10">
                            {cinema.city || cinema.locationName || 'Cinema'}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                              isOpen
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
                              }`}
                            />
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>

                        {/* Selected Indicator */}
                        {selected && (
                          <div className="absolute bottom-2.5 right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-red-500/40">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Cinema Details: Title & Red MapPin Address */}
                      <div className="flex flex-1 flex-col justify-between pt-3.5 pb-1 px-1">
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight transition-colors group-hover:text-[var(--primary)] sm:text-lg">
                            {cinema.name}
                          </h3>

                          <p className="mt-2 flex items-start gap-1.5 text-xs text-zinc-400 leading-relaxed sm:text-sm">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E50914]" />
                            <span className="line-clamp-2">{cinema.address || 'Address not listed'}</span>
                          </p>
                        </div>

                        {/* Bottom Meta & Call-to-action */}
                        <div className="mt-4 border-t border-white/5 pt-2.5 flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1 text-muted-foreground font-medium text-[11px]">
                            <Film className="h-3 w-3 text-[var(--primary)]" />
                            {catalogRequiresSignIn
                              ? 'View details'
                              : `${count} ${count === 1 ? 'screening' : 'screenings'}`}
                          </span>

                          <span className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] transition-transform duration-200 group-hover:translate-x-1">
                            Showtimes
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {locationError && (
              <p role="status" className="mt-4 text-xs text-muted-foreground text-center">
                Map details are temporarily unavailable.{' '}
                <button onClick={() => void fetchCinemas(true)} className="underline hover:text-foreground">
                  Retry
                </button>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
