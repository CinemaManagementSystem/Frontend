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
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-sm text-white/50">The requested movie could not be found in our catalog.</p>
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
    <div className="relative isolate bg-transparent pb-24 text-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] overflow-hidden" aria-hidden="true">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt=""
          className="h-full w-full scale-125 object-cover object-center opacity-45 blur-[80px] saturate-150"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0204]/65 to-[#0a0204]" />
      </div>

      <section className="container-main pt-8">
        <Link
          to="/movies"
          className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Link>

        <div className="w-full">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:aspect-[16/7]">
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 via-45% to-black/10" />
            <div className="absolute inset-y-0 left-0 z-10 flex w-full max-w-[470px] flex-col justify-center px-7 sm:px-12">
              <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
                {movie.title}
              </h1>

              <div className="mt-7 space-y-3">
                {metaRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[var(--primary)] text-white">
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="text-white/70">{label}:</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {movie.trailerUrl && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[0_0_30px_rgba(225,29,46,0.45)] transition hover:scale-105 hover:bg-[#f03a48] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Watch ${movie.title} trailer`}
              >
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </button>
            )}
          </div>

          <div className="mt-14 flex items-center justify-center gap-5" role="tablist" aria-label="Movie detail tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'SHOWTIME'}
              onClick={() => setActiveTab('SHOWTIME')}
              className={cn(
                'text-xl font-bold transition-colors',
                activeTab === 'SHOWTIME' ? 'text-white' : 'text-white/45 hover:text-white/75',
              )}
            >
              Showtime
            </button>
            <div className="h-8 w-px bg-white/20" aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'DETAIL'}
              onClick={() => setActiveTab('DETAIL')}
              className={cn(
                'text-xl font-bold transition-colors',
                activeTab === 'DETAIL' ? 'text-white' : 'text-white/45 hover:text-white/75',
              )}
            >
              Detail
            </button>
          </div>
        </div>
      </section>

      <div className="mt-8 border-t border-white/10" />

      <section className="container-main pt-9">
        <div className="w-full" role="tabpanel">
          {activeTab === 'SHOWTIME' ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-white">Showtime</h2>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLocationOpen((open) => !open)}
                  className="flex h-14 w-full items-center justify-between rounded border border-white/10 bg-white/[0.06] px-5 text-left text-sm font-semibold text-white transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-haspopup="listbox"
                  aria-expanded={locationOpen}
                >
                  <span>{selectedCinemaId === 'ALL' ? 'All Locations' : selectedCinemaName}</span>
                  <ChevronDown className={cn('h-4 w-4 text-white/80 transition-transform', locationOpen && 'rotate-180')} />
                </button>

                {locationOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-30 cursor-default"
                      aria-label="Close location selector"
                      onClick={() => setLocationOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-black/95 p-1 shadow-2xl backdrop-blur-xl" role="listbox" aria-label="Select location">
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
                          'flex w-full items-center gap-3 rounded-md border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-white/75 last:border-b-0 hover:bg-white/5 hover:text-white',
                          selectedCinemaId === 'ALL' && 'text-[var(--primary)]',
                        )}
                      >
                        <MapPin className="h-4 w-4 text-[var(--primary)]" />
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
                            'flex w-full items-center gap-3 rounded-md border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-white/75 last:border-b-0 hover:bg-white/5 hover:text-white',
                            selectedCinemaId === cinema.id && 'text-[var(--primary)]',
                          )}
                        >
                          <MapPin className="h-4 w-4 text-[var(--primary)]" />
                          <span className="min-w-0 truncate">{cinema.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto">
                {showDates.slice(0, 7).map((date) => {
                  const active = activeDate === date.dateStr;
                  return (
                    <button
                      key={date.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(date.dateStr)}
                      aria-pressed={active}
                      className={cn(
                        'flex h-[66px] min-w-[130px] snap-start flex-col items-center justify-center rounded-lg border bg-black/60 px-4 transition-colors hover:border-white/50',
                        active ? 'border-red-600 text-white shadow-[0_0_20px_rgba(225,29,46,0.25)]' : 'border-white/20 text-white/70',
                      )}
                    >
                      <span className="text-xs leading-none text-white/70">{date.isToday ? 'Today' : date.dayName}</span>
                      <span className="mt-1 text-xl font-bold leading-none text-white">{date.dayNum}</span>
                      <span className="mt-1 text-xs leading-none text-white/70">{date.monthName}</span>
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center space-y-2">
                  <Ticket className="mx-auto h-8 w-8 text-white/40" />
                  <p className="text-sm font-semibold text-white">
                    {selectedCinemaId === 'ALL' ? 'No upcoming showtimes currently available' : `No upcoming showtimes at ${selectedCinemaName}`}
                  </p>
                  <p className="text-xs text-white/40">
                    {selectedCinemaId === 'ALL' ? 'Please check back shortly for new screenings.' : 'Choose All Locations above to check other cinemas.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Synopsis</h3>
                <p className="text-sm leading-relaxed text-white">{movie.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Director</span>
                  <p className="text-sm font-semibold text-white">{movie.director}</p>
                </div>
                <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Starring Cast</span>
                  <p className="text-sm font-semibold text-white">{movie.cast.join(', ')}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {movie.rating.toFixed(1)} / 10 ({movie.voteCount} votes)
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/60">{movie.genres.join(' · ')}</span>
                <span className="text-white/20">·</span>
                <span className="inline-flex items-center gap-1 text-white/60">
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
