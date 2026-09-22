import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Film,
  MapPin,
  Play,
  Star,
  Ticket,
  Type,
  ShieldQuestion,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { Modal } from '@/components/ui/Modal/Modal';
import { ShowtimeList } from '@/components/common/ShowtimeList/ShowtimeList';
import { getRatingBadge } from '@/components/common/RatingBadge/ratingBadge';
import { formatDuration, formatDate } from '@/utils/formatDate';
import { getCinemaDate, isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';
import { cn } from '@/lib/utils';
import type { Showtime } from '@/types/movie';

const dateFormatter = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

const getDateString = (date: Date) => date.toISOString().slice(0, 10);

type DetailTab = 'SHOWTIME' | 'DETAIL';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieById, getShowtimesByMovieId, fetchCatalog } = useMovieStore();
  const { cinemas, selectedCinemaId, selectCinema } = useCinemaStore();
  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);
  const selectedCinemaName = selectedCinema?.name || 'your selected cinema';
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('SHOWTIME');
  const [locationOpen, setLocationOpen] = useState(false);
  const now = useShowtimeClock();
  const today = getCinemaDate();

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const movie = getMovieById(id || '');
  const showtimes = useMemo(() => {
    if (!movie) return [];
    return getShowtimesByMovieId(movie.id)
      .filter((showtime) => isUpcomingShowtime(showtime, now) &&
        (selectedCinemaId === 'ALL' || showtime.cinemaId === selectedCinemaId))
      .sort((a, b) => parseShowtimeStart(a.startTime) - parseShowtimeStart(b.startTime));
  }, [movie, now, selectedCinemaId, getShowtimesByMovieId]);

  const showDates = useMemo(() => {
    if (!movie) return [];
    const dateSet = Array.from(new Set(showtimes.map((showtime) => showtime.date))).sort();
    const firstDate = new Date(`${today}T12:00:00Z`);
    const rolling = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(firstDate);
      date.setUTCDate(firstDate.getUTCDate() + index);
      return getDateString(date);
    });
    return [...new Set([...rolling, ...dateSet])].sort().map((d) => ({
      dateStr: d,
      dayName: d === today ? 'Today' : dateFormatter(d, { weekday: 'short' }),
      dayNum: dateFormatter(d, { day: 'numeric' }),
      monthName: dateFormatter(d, { month: 'short' }),
      isToday: d === today,
      hasShowtimes: dateSet.includes(d),
    }));
  }, [movie, showtimes, today]);

  const activeDate = showDates.some((d) => d.dateStr === selectedDate) ? selectedDate : showDates.find((d) => d.hasShowtimes)?.dateStr ?? today;
  const displayedShowtimes = showtimes.filter((showtime) => showtime.date === activeDate);

  const showtimeGroups = useMemo(() => {
    const groupsMap = new Map<string, { cinemaId: string; cinemaName: string; hallName: string; format: string; language: string; shows: Showtime[] }>();
    displayedShowtimes.forEach((show) => {
      const key = `${show.cinemaId}-${show.hallName}-${show.format}`;
      const existing = groupsMap.get(key);
      if (existing) {
        existing.shows.push(show);
      } else {
        groupsMap.set(key, {
          cinemaId: show.cinemaId,
          cinemaName: show.cinemaName,
          hallName: show.hallName,
          format: show.format,
          language: 'KH/EN',
          shows: [show],
        });
      }
    });
    return Array.from(groupsMap.values()).map((g) => ({ ...g, shows: [...g.shows].sort((a, b) => a.time.localeCompare(b.time)) }));
  }, [displayedShowtimes]);

  if (!movie) {
    return (
      <div className="container-main py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Movie Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested movie could not be found in our catalog.</p>
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Link>
      </div>
    );
  }

  const metaRows = [
    { icon: Type, label: 'Genre', value: movie.genres.join(', ') || '—' },
    { icon: Clock, label: 'Duration', value: formatDuration(movie.durationMinutes) },
    { icon: Calendar, label: 'Release date', value: formatDate(movie.releaseDate) },
    { icon: ShieldQuestion, label: 'Classification', value: getRatingBadge(movie.rating) },
  ];

  return (
    <div className="relative isolate bg-transparent pb-24 text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden" aria-hidden="true">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt=""
          className="h-full w-full object-cover object-top opacity-30 dark:opacity-40 blur-2xl"
          style={{ filter: 'saturate(1.4) brightness(0.6) blur(80px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>

      <section className="container-main pt-8">
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-14">
          {/* Movie Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
                {movie.title}
              </h1>

              <div className="mt-7 space-y-3">
                {metaRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="meta-icon-square">
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}:</span>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {movie.trailerUrl && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[var(--primary)]/30 transition hover:bg-[#ff1f2d]"
                  aria-label={`Watch ${movie.title} trailer`}
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Trailer
                </button>
              </div>
            )}
          </div>

          {/* Movie Poster */}
          <div className="relative order-first lg:order-none">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[300px] lg:max-w-none">
              <div className="absolute inset-0 -left-8 -z-10 bg-gradient-to-r from-background via-background to-transparent" />
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="aspect-[2/3] w-full rounded-lg object-cover shadow-2xl shadow-black/20 dark:shadow-black/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container-main mt-12">
        <div className="flex items-center gap-6 border-b border-border" role="tablist" aria-label="Movie detail tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'SHOWTIME'}
            onClick={() => setActiveTab('SHOWTIME')}
            className={cn(
              'py-3 text-base font-black uppercase tracking-wide transition-colors',
              activeTab === 'SHOWTIME' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Showtime
          </button>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'DETAIL'}
            onClick={() => setActiveTab('DETAIL')}
            className={cn(
              'py-3 text-base font-black uppercase tracking-wide transition-colors',
              activeTab === 'DETAIL' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Detail
          </button>
        </div>
      </section>

      <section className="container-main pt-9">
        <div className="w-full" role="tabpanel">
          {activeTab === 'SHOWTIME' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Showtime</h2>

                <div className="mt-4 relative inline-block">
                  <button
                    type="button"
                    onClick={() => setLocationOpen((open) => !open)}
                    className="flex h-11 items-center gap-3 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-accent"
                    aria-haspopup="listbox"
                    aria-expanded={locationOpen}
                  >
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{selectedCinemaId === 'ALL' ? 'All Locations' : selectedCinemaName}</span>
                    <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', locationOpen && 'rotate-180')} />
                  </button>

                  {locationOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-30 cursor-default"
                        aria-label="Close location selector"
                        onClick={() => setLocationOpen(false)}
                      />
                      <div className="absolute left-0 top-full z-40 mt-2 max-h-72 w-64 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-2xl backdrop-blur-xl" role="listbox" aria-label="Select location">
                        <button
                          type="button"
                          role="option"
                          aria-selected={selectedCinemaId === 'ALL'}
                          onClick={() => {
                            selectCinema('ALL');
                            setSelectedDate('');
                            setLocationOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-semibold text-foreground hover:bg-accent',
                            selectedCinemaId === 'ALL' && 'text-primary bg-primary/10',
                          )}
                        >
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          All Locations
                        </button>
                        {cinemas.map((cinema) => (
                          <button
                            key={cinema.id}
                            type="button"
                            role="option"
                            aria-selected={selectedCinemaId === cinema.id}
                            onClick={() => {
                              selectCinema(cinema.id);
                              setSelectedDate('');
                              setLocationOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-semibold text-foreground hover:bg-accent',
                              selectedCinemaId === cinema.id && 'text-primary bg-primary/10',
                            )}
                          >
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span className="min-w-0 truncate">{cinema.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto">
                {showDates.slice(0, 7).map((date) => {
                  const active = activeDate === date.dateStr;
                  return (
                    <button
                      key={date.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(date.dateStr)}
                      aria-pressed={active}
                      className={cn(
                        'date-card snap-start',
                        active ? 'date-card-selected' : 'date-card-unselected',
                      )}
                    >
                      <span className="text-[11px] leading-none text-muted-foreground">{date.isToday ? 'Today' : date.dayName}</span>
                      <span className="mt-1 text-lg font-bold leading-none">{date.dayNum}</span>
                      <span className="mt-1 text-[11px] leading-none text-muted-foreground">{date.monthName}</span>
                    </button>
                  );
                })}
              </div>

              {showtimeGroups.length > 0 ? (
                <ShowtimeList
                  groups={showtimeGroups}
                  onBookShowtime={(show) => navigate(`/booking/${show.id}?movieId=${movie.id}`)}
                />
              ) : (
                <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
                  <Ticket className="mx-auto h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">
                    {selectedCinemaId === 'ALL' ? 'No upcoming showtimes currently available' : `No upcoming showtimes at ${selectedCinemaName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCinemaId === 'ALL' ? 'Please check back shortly for new screenings.' : 'Choose All Locations above to check other cinemas.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Synopsis</h3>
                <p className="text-sm leading-relaxed text-foreground">{movie.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-xl border border-border bg-card p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Director</span>
                  <p className="text-sm font-semibold text-foreground">{movie.director}</p>
                </div>
                <div className="space-y-1 rounded-xl border border-border bg-card p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Starring Cast</span>
                  <p className="text-sm font-semibold text-foreground">{movie.cast.join(', ')}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {movie.rating.toFixed(1)} / 10 ({movie.voteCount} votes)
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">{movie.genres.join(' · ')}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Film className="h-3.5 w-3.5" />
                  {movie.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trailer Video Modal */}
      <Modal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        maxWidth="2xl"
        title={`${movie.title} - Official Trailer`}
      >
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {movie.trailerUrl && (
            <iframe
              src={movie.trailerUrl}
              title={movie.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
