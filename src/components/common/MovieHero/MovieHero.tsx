import React from 'react';
import { Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRatingBadge } from '../RatingBadge/ratingBadge';
import type { Movie } from '@/types/movie';
import { formatDuration } from '@/utils/formatDate';

interface MovieHeroProps {
  movie: Movie;
  trailerUrl?: string;
  onBookNow?: () => void;
  onViewDetails?: () => void;
  onWatchTrailer?: () => void;
  className?: string;
}

export const MovieHero: React.FC<MovieHeroProps> = ({
  movie,
  trailerUrl,
  onBookNow,
  onViewDetails,
  onWatchTrailer,
  className = '',
}) => {
  return (
    <section className={cn('relative w-full overflow-hidden', className)} aria-labelledby="movie-title">
      <div className="absolute inset-0 -z-20">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />
      </div>

      <div className="relative z-10 container-main pt-8 pb-12 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="rounded-md bg-[var(--primary)] px-3 py-1.5 uppercase tracking-wide">
                {movie.status.replace('_', ' ')}
              </span>
              <span className="rounded-md border border-white/20 bg-black/35 px-3 py-1.5 text-white/80">{getRatingBadge(movie.rating)}</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-black/35 px-3 py-1.5 text-amber-300">
                <Star className="h-3.5 w-3.5 fill-current" />
                {movie.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-black/35 px-3 py-1.5 text-white/75">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(movie.durationMinutes)}
              </span>
            </div>

            <h1 id="movie-title" className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.92] tracking-[-0.045em] text-white">
              {movie.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/90">
              {movie.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {onBookNow && (
                <button type="button" onClick={onBookNow} className="btn-pill-primary">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6"/><path d="M18 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
                  Book Now
                </button>
              )}
              {onViewDetails && (
                <button type="button" onClick={onViewDetails} className="btn-pill-outline">
                  View details <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              )}
              {trailerUrl && onWatchTrailer && (
                <button type="button" onClick={onWatchTrailer} className="icon-btn-circle" aria-label={`Watch ${movie.title} trailer`}>
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
              )}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative aspect-[2/3] w-full max-w-xs mx-auto">
              <div className="absolute inset-0 -z-10 bg-gradient-to-l from-black via-transparent to-transparent rounded-lg" />
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="aspect-[2/3] w-full rounded-lg object-cover shadow-2xl shadow-black/60"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};