import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Play,
  Ticket,
  Film,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { formatDuration, formatCurrency, formatDate } from '@/utils/formatDate';
import { isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMovieById, getShowtimesByMovieId, fetchCatalog, catalogRequiresSignIn } = useMovieStore();
  const { cinemas, selectedCinemaId, selectCinema } = useCinemaStore();
  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);
  const selectedCinemaName = selectedCinema?.name || 'your selected cinema';
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const now = useShowtimeClock();

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const movie = getMovieById(id || '');
  const showtimes = movie ? getShowtimesByMovieId(movie.id)
    .filter((showtime) => isUpcomingShowtime(showtime, now) &&
      (selectedCinemaId === 'ALL' || showtime.cinemaId === selectedCinemaId))
    .sort((a, b) => parseShowtimeStart(a.startTime) - parseShowtimeStart(b.startTime)) : [];
  const showDates = Array.from(new Set(showtimes.map((showtime) => showtime.date))).sort();
  const activeDate = showDates.includes(selectedDate) ? selectedDate : showDates[0];
  const displayedShowtimes = showtimes.filter((showtime) => showtime.date === activeDate);

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Movie Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested movie could not be found in our catalog.
        </p>
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E50914] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Movie Hero Backdrop */}
      <section className="relative w-full min-h-[50vh] lg:min-h-[60vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-55 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0f0f10] dark:via-[#0f0f10]/80 dark:to-transparent" />
        </div>

        {/* Back link & breadcrumbs */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Link>
        </div>
      </section>

      {/* Main Info Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Movie Poster Card */}
          <div className="md:col-span-1 space-y-4">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-border bg-muted dark:bg-zinc-900">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {movie.trailerUrl && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-muted hover:bg-[#E50914]/10 border border-border text-foreground hover:text-[#E50914] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Play className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
                Watch Trailer
              </button>
            )}
          </div>

          {/* Detailed Info */}
          <div className="md:col-span-3 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="md">
                  {movie.status.replace('_', ' ')}
                </Badge>
                <Badge variant="secondary" size="md">
                  PG-13
                </Badge>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-amber-200 text-xs font-bold text-slate-900 dark:bg-black/60 dark:border-border dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                  <span>{movie.rating.toFixed(1)} / 10 ({movie.voteCount} votes)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-foreground uppercase tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDuration(movie.durationMinutes)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Release: {formatDate(movie.releaseDate)}
                </span>
                <span>•</span>
                <span className="text-foreground font-medium">
                  {movie.genres.join(', ')}
                </span>
              </div>
            </div>

            {/* Synopsis */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Synopsis
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Crew & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Director
                </span>
                <p className="text-sm font-semibold text-foreground">{movie.director}</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Starring Cast
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {movie.cast.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showtime Schedule Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-t border-border pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-wide">
                SELECT SHOWTIME & THEATER
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Pick your preferred cinema hall, format, and time slot to reserve seats
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground"><MapPin className="h-3.5 w-3.5 text-[#E50914]" />{selectedCinemaId === 'ALL' ? 'All cinemas' : selectedCinemaName}</span>
                {selectedCinemaId !== 'ALL' && <button type="button" onClick={() => { selectCinema('ALL'); setSelectedDate(''); }} className="font-semibold text-[#E50914] underline underline-offset-4">View all cinemas</button>}
              </div>
            </div>

            {/* Date Picker Buttons */}
            <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto py-2">
              {showDates.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`shrink-0 rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                    activeDate === d
                      ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-500/30'
                      : 'border-transparent bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {formatDate(`${d}T12:00:00`)}
                </button>
              ))}
            </div>
          </div>

          {/* Showtimes List */}
          <div className="space-y-4">
            {catalogRequiresSignIn ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Sign in to see cinema halls and reserve your seats.</p>
                <Link to={`/login?redirect=${encodeURIComponent(`/movies/${movie.id}`)}`} className="inline-flex rounded-xl bg-[#E50914] px-5 py-3 text-sm font-bold text-white">Sign in to view showtimes</Link>
              </div>
            ) : displayedShowtimes.length > 0 ? (
              displayedShowtimes.map((st) => (
                <div
                  key={st.id}
                  className="p-5 rounded-2xl border border-border/80 bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-red-500/80 hover:bg-red-500/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center shrink-0">
                      <Film className="w-6 h-6 text-[#E50914]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-base">
                          {st.cinemaName}
                        </h4>
                        <span className="inline-flex items-center rounded-full border border-border/80 bg-card px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                          {st.format}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {st.hallName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-muted-foreground block">Ticket Price</span>
                      <span className="text-base font-black text-foreground">
                        {formatCurrency(st.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (isUpcomingShowtime(st)) navigate(`/booking/${st.id}?movieId=${movie.id}`);
                        else void fetchCatalog();
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#E50914]/30"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{st.time} - Reserve</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-2">
                <Ticket className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-foreground">
                  {selectedCinemaId === 'ALL' ? 'No upcoming showtimes currently available' : `No upcoming showtimes at ${selectedCinemaName}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedCinemaId === 'ALL' ? 'Please check back shortly for new screenings.' : 'Choose All cinemas above to check other locations.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trailer Video Modal */}
      <Modal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        maxWidth="2xl"
        title={`${movie.title} - Official Trailer`}
      >
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
          {movie.trailerUrl && (
            <iframe
              src={movie.trailerUrl}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
