import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getRatingBadge } from '../RatingBadge/ratingBadge';
import type { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'home' | 'now' | 'soon';
  showAdvanceTicket?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

const FALLBACK_POSTER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%230d0d10"/%3E%3Ctext x="200" y="300" text-anchor="middle" fill="%23a1a1aa" font-family="Arial" font-size="24"%3ENo poster available%3C/text%3E%3C/svg%3E';

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  className = '',
  onClick,
  variant = 'default',
  showAdvanceTicket = false,
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

  const getStatusLabel = (status: Movie['status']) => {
    if (status === 'COMING_SOON') return 'Coming Soon';
    if (status === 'FEATURED') return 'Featured';
    return 'Now Showing';
  };
  const listingVariant = variant === 'home' || variant === 'now' || variant === 'soon';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn('movie-card group', listingVariant && 'home-movie-card', className)}
      role="article"
      aria-label={movie.title}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className={cn(
        'relative aspect-[2/3] w-full overflow-hidden rounded-lg',
        listingVariant ? 'border border-white/10 bg-white/5' : 'bg-card',
      )}>
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
            listingVariant
              ? 'h-full w-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.03]'
              : 'movie-card-poster transition-opacity duration-300',
            posterLoaded ? 'opacity-100' : 'opacity-0',
          )}
          loading="lazy"
        />
        {showAdvanceTicket && (
          <span className="absolute -left-10 top-5 w-40 -rotate-45 bg-red-600 py-1 text-center text-[11px] font-semibold text-white shadow">
            Advance Ticket
          </span>
        )}

        {!listingVariant && <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white/85 backdrop-blur">
            {getStatusLabel(movie.status)}
          </span>
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/65 px-2 py-1 text-[10px] font-bold text-amber-300 backdrop-blur">
            <Star className="h-3 w-3 fill-current" />
            {movie.rating.toFixed(1)}
          </span>
        </>}
      </div>

      <div className={cn('mt-3 flex flex-col gap-1', listingVariant && 'mt-4')}>
        {listingVariant && <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="movie-card-date">{new Date(`${movie.releaseDate}T12:00:00Z`).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
          <span className="movie-card-rating">{getRatingBadge(movie.rating)}</span>
        </div>}
        <h3 className="movie-card-title">{movie.title}</h3>
        {!listingVariant && <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="movie-card-date">{new Date(movie.releaseDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span className="movie-card-rating">{getRatingBadge(movie.rating)}</span>
        </div>}
      </div>
    </motion.div>
  );
};
