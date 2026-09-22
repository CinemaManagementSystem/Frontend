import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Film,
  Play,
  Star,
  Ticket,
  Type,
  ShieldQuestion,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useAuthStore } from '@/store/authStore';
import { DateSelector } from '@/components/common/DateSelector/DateSelector';
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
  const catalogRequiresSignIn = !useAuthStore((state) => state.isAuthenticated);
  const { cinemas, selectedCinemaId, selectCinema } = useCinemaStore();
  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);
  const selectedCinemaName = selectedCinema?.name || 'your selected cinema';
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('SHOWTIME');
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
    const dates = dateSet.length ? dateSet : rolling;
    return dates.map((d) => ({
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
    const groupsMap = new Map<string, { cinemaId: string; cinemaName: string; sessions: { hallName: string; format: string; language: string; shows: Showtime[] }[] }>();
    displayedShowtimes.forEach((show) => {
      let cinemaGroup = groupsMap.get(show.cinemaId);
      if (!cinemaGroup) {
        cinemaGroup = { cinemaId: show.cinemaId, cinemaName: show.cinemaName, sessions: [] };
        groupsMap.set(show.cinemaId, cinemaGroup);
      }
      const session = cinemaGroup.sessions.find((item) => item.hallName === show.hallName && item.format === show.format);
      if (session) session.shows.push(show);
      else cinemaGroup.sessions.push({ hallName: show.hallName, format: show.format, language: 'KH/EN', shows: [show] });
    });
    return Array.from(groupsMap.values()).map((group) => ({
      ...group,
      sessions: group.sessions.map((session) => ({ ...session, shows: [...session.shows].sort((a, b) => a.time.localeCompare(b.time)) })),
    }));
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
    { icon: Calendar, label: 'Release', value: formatDate(movie.releaseDate) },
    { icon: ShieldQuestion, label: 'Classification', value: getRatingBadge(movie.rating) },
  ];

  return (
    <div className="relative isolate bg-transparent pb-24 text-foreground">
      <section className="relative isolate overflow-hidden bg-transparent py-4 sm:py-6">
        <div aria-hidden="true" className="absolute inset-0 -z-10 scale-110 bg-cover bg-center opacity-40 blur-3xl" style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-background/55 to-background" />
        <div className="container-main">
          <Link to="/movies" className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Movies
          </Link>
          <div className="relative min-h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#7d0009] via-[#1b060b] to-black shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:min-h-0 sm:aspect-[16/6]">
            <img src={movie.backdropUrl || movie.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-95 saturate-110" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/58 to-black/8" aria-hidden="true" />
            <div className="relative flex h-full max-w-[580px] flex-col justify-center px-6 py-8 sm:px-10 lg:px-16">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-red-400/50 bg-red-950/35 px-4 py-1.5 text-xs font-semibold text-white">
                <Film className="h-3.5 w-3.5" aria-hidden="true" />
                {movie.status === 'COMING_SOON' ? 'Coming soon' : 'Now showing'}
              </span>
              <h1 className="max-w-xl text-3xl font-extrabold leading-[1.02] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,.45)] sm:text-4xl lg:text-5xl">{movie.title}</h1>
              <div className="mt-5 grid max-w-lg gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {metaRows.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex min-w-0 items-center gap-2.5">
                    <span className="meta-icon-square shrink-0"><Icon className="h-3.5 w-3.5 text-white" /></span>
                    <span className="min-w-0 text-xs text-white/85"><span className="text-white/55">{label}: </span><span className="font-bold">{value}</span></span>
                  </div>
                ))}
              </div>
              {movie.trailerUrl && <button type="button" onClick={() => setTrailerOpen(true)} className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--primary)]/30 transition hover:bg-[#ff1f2d]" aria-label={`Watch ${movie.title} trailer`}><Play className="h-3.5 w-3.5 fill-current" />Watch Trailer</button>}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs — Showtime | Detail */}
      <section className="container-main mt-10">
        <div
          className="flex items-center gap-0 border-b border-border"
          role="tablist"
          aria-label="Movie detail tabs"
        >
          {(['SHOWTIME', 'DETAIL'] as const).map((tab, idx) => (
            <React.Fragment key={tab}>
              {idx > 0 && <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-3 text-sm font-bold capitalize tracking-wide transition-colors',
                  activeTab === tab
                    ? 'border-b-2 border-[var(--primary)] text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Tab content */}
      <section className="container-main pt-8">
        <div className={cn('w-full', activeTab === 'DETAIL' && 'mx-auto max-w-5xl')} role="tabpanel">
          {activeTab === 'SHOWTIME' ? (
            <div className="space-y-5">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Showtime</h2>
              <label className="relative block">
                <span className="sr-only">Choose a cinema location</span>
                <select
                  aria-label="Choose a cinema location"
                  value={selectedCinemaId}
                  onChange={(event) => { selectCinema(event.target.value); setSelectedDate(''); }}
                  className="h-14 w-full appearance-none rounded-lg border border-white/10 bg-white/[0.055] px-5 pr-12 text-sm font-medium text-foreground outline-none transition focus:border-[var(--primary)]/70 focus:ring-2 focus:ring-[var(--primary)]/20"
                >
                  <option value="ALL" className="bg-card text-foreground">All Locations</option>
                  {cinemas.map((cinema) => <option key={cinema.id} value={cinema.id} className="bg-card text-foreground">{cinema.name}</option>)}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground" aria-hidden="true"><ChevronDown className="h-4 w-4" /></span>
              </label>

              <DateSelector
                dateList={showDates}
                selectedDate={activeDate}
                onSelectDate={setSelectedDate}
                className="w-full"
                showLabel={false}
                variant="home"
              />

              {/* Showtime list or states */}
              {catalogRequiresSignIn ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Sign in to see cinema halls and reserve your seats.</p>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(`/movies/${movie.id}`)}`}
                    className="inline-flex rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"
                  >
                    Sign in to view showtimes
                  </Link>
                </div>
              ) : showtimeGroups.length > 0 ? (
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
            /* Detail tab */
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

      {/* Trailer Modal */}
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
