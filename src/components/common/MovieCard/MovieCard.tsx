import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Ticket } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Movie } from '@/types/movie';

export interface MovieCardProps {
  movie: Movie;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'home' | 'now' | 'soon';
  showAdvanceTicket?: boolean;
  nextShowtime?: string;
  onBookNow?: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

const FALLBACK_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%230d0d10"/%3E%3Ctext x="200" y="300" text-anchor="middle" fill="%23a1a1aa" font-family="Arial" font-size="24"%3ENo poster available%3C/text%3E%3C/svg%3E';

function getAgeRating(rating: number, genres: string[]): string {
  const isHorrorOrThriller = genres.some((g) => ['horror', 'thriller', 'crime'].includes(g.toLowerCase()));
  const isAnimationOrFamily = genres.some((g) => ['animation', 'family', 'comedy'].includes(g.toLowerCase()));

  if (isHorrorOrThriller || rating >= 8.5) return '18+';
  if (isAnimationOrFamily) return 'G';
  if (rating >= 7.0) return 'PG-13';
  return '15+';
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  className = '',
  onClick,
  variant: _variant = 'default',
  showAdvanceTicket = false,
  nextShowtime,
  onBookNow,
}) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [posterSrc, setPosterSrc] = useState(movie.posterUrl || FALLBACK_POSTER);
  const [posterLoaded, setPosterLoaded] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/movies/${movie.id}`);
    }
  };

  const handleBookNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookNow) {
      onBookNow();
    } else {
      navigate(`/movies/${movie.id}`);
    }
  };

  const ageRating = getAgeRating(movie.rating, movie.genres || []);
  const showtimeLabel =
    nextShowtime ||
    (movie.status === 'COMING_SOON'
      ? `Releasing ${new Date(`${movie.releaseDate}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
      : 'Today, 7:30 PM');

  return (
    <motion.div
      variants={cardVariants}
      whileHover={shouldReduceMotion ? {} : { y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        'group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-card p-3 transition-all duration-300 hover:border-[#E50914]/50 hover:shadow-xl hover:shadow-black/60 cursor-pointer',
        className,
      )}
      role="article"
      aria-label={movie.title}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      {/* Poster with badges */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted/40 shadow-inner">
        {!posterLoaded && <div className="absolute inset-0 animate-pulse bg-white/10" aria-hidden="true" />}
        <img
          src={posterSrc}
          alt={`${movie.title} poster`}
          onLoad={() => setPosterLoaded(true)}
          onError={() => {
            if (posterSrc !== FALLBACK_POSTER) setPosterSrc(FALLBACK_POSTER);
            else setPosterLoaded(true);
          }}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
            posterLoaded ? 'opacity-100' : 'opacity-0',
          )}
          loading="lazy"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges: Age Rating & Rating Score */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <span className="rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/10">
            {ageRating}
          </span>
          {movie.rating > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {movie.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Advance ticket banner if applicable */}
        {showAdvanceTicket && (
          <span className="absolute -left-10 top-5 w-40 -rotate-45 bg-[#E50914] py-1 text-center text-[10px] font-black tracking-wider uppercase text-white shadow-lg">
            Advance
          </span>
        )}

        {/* Bottom tags on poster: Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-wrap gap-1 z-10 pointer-events-none">
            {movie.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="rounded bg-black/65 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-medium text-white/90 border border-white/10"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Info & Actions */}
      <div className="mt-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3
            className="text-sm font-bold text-foreground leading-snug line-clamp-1 group-hover:text-[#E50914] transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Contextual Next Available Showtime */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-400 truncate">
              {showtimeLabel}
            </span>
          </div>
        </div>

        {/* Prominent Book Now Button */}
        <button
          type="button"
          onClick={handleBookNowClick}
          className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#E50914]/25 hover:shadow-[#E50914]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>{movie.status === 'COMING_SOON' ? 'View Details' : 'Book Now'}</span>
        </button>
      </div>
    </motion.div>
  );
};
