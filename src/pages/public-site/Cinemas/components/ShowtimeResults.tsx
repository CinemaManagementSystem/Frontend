import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Film, MapPin, Star } from 'lucide-react';
import type { Movie, Showtime } from '@/types/movie';
import { isUpcomingShowtime } from '@/lib/showtime';
import { formatCurrency } from '@/utils/formatCurrency';

interface ShowtimeResultsProps {
  showtimesByMovie: Record<string, Showtime[]>;
  movies: Movie[];
  showCinemaName?: boolean;
  onShowtimeExpired?: () => void;
}

const formatTime12h = (time24: string): string => {
  const [hour, minute] = time24.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time24;
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const getFormatBadgeClass = (format: string) => {
  const f = format.toLowerCase();
  if (f.includes('imax')) return 'format-badge-imax';
  if (f.includes('dolby')) return 'format-badge-dolby';
  if (f.includes('3d')) return 'format-badge-3d';
  return 'format-badge-2d';
};

export const ShowtimeResults = ({ showtimesByMovie, movies, showCinemaName = false, onShowtimeExpired }: ShowtimeResultsProps) => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const bookShowtime = (show: Showtime) => {
    if (!isUpcomingShowtime(show)) {
      setNotice('Booking has closed for that screening. Please choose another time.');
      onShowtimeExpired?.();
      return;
    }
    navigate(`/booking/${show.id}?movieId=${show.movieId}`);
  };

  return (
    <div className="space-y-4">
      {notice && <p role="alert" className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3 text-sm">{notice}</p>}
      {Object.entries(showtimesByMovie).map(([movieId, movieShowtimes]) => {
        const movie = movies.find((item) => item.id === movieId);
        if (!movie) return null;
        const groups = movieShowtimes.reduce<Record<string, Showtime[]>>((result, show) => {
          (result[`${show.cinemaId}-${show.hallName}-${show.format}`] ??= []).push(show);
          return result;
        }, {});
        return (
          <article key={movie.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
            <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-x-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-x-5">
              <Link to={`/movies/${movie.id}`} className="row-span-2 self-start overflow-hidden rounded-lg bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" aria-label={`View ${movie.title}`}>
                {movie.posterUrl ? <img src={movie.posterUrl} alt="" loading="lazy" className="aspect-[2/3] w-full object-cover" /> : <span className="flex aspect-[2/3] items-center justify-center"><Film className="h-8 w-8 text-white/40" /></span>}
              </Link>
              <div className="min-w-0">
                <Link to={`/movies/${movie.id}`} className="inline-flex items-start gap-2 hover:text-[var(--primary)]"><h3 className="text-lg font-black tracking-tight sm:text-2xl">{movie.title}</h3></Link>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                  {movie.durationMinutes > 0 && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{movie.durationMinutes} min</span>}
                  {movie.genres.length > 0 && <span>{movie.genres.join(' · ')}</span>}
                  {movie.rating > 0 && <span className="inline-flex items-center gap-1 text-amber-300"><Star className="h-3 w-3" />{movie.rating.toFixed(1)}</span>}
                </div>
                {movie.description && <p className="mt-3 hidden text-xs leading-relaxed text-white/50 sm:line-clamp-2">{movie.description}</p>}
              </div>
              <div className="col-span-2 mt-4 space-y-4 border-t border-white/10 pt-4 sm:col-span-1 sm:col-start-2">
                {Object.entries(groups).map(([key, shows]) => {
                  const first = shows[0];
                  return <div key={key}>
                    <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/50">{showCinemaName && <span className="inline-flex items-center gap-1 font-semibold text-white"><MapPin className="h-3 w-3 text-[var(--primary)]" />{first.cinemaName}</span>}<span className="hall-label">{first.hallName}</span><span className={getFormatBadgeClass(first.format)}>{first.format === 'Dolby' ? 'Dolby Atmos' : first.format}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {[...shows].sort((a, b) => a.time.localeCompare(b.time)).map((show) => <button type="button" key={show.id} onClick={() => bookShowtime(show)} aria-label={`Book ${movie.title} at ${formatTime12h(show.time)}, ${show.cinemaName}, ${show.hallName}`} className="time-slot-pill"><span className="block font-bold tabular-nums">{formatTime12h(show.time)}</span><span className="mt-0.5 block text-[10px] text-white/50">From {formatCurrency(show.price)}</span></button>)}
                    </div>
                  </div>;
                })}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};