import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Movie } from '@/types/movie';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatDuration, formatCurrency } from '@/utils/formatDate';

export interface MovieCardProps {
  movie: Movie;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

export const MovieCard: React.FC<MovieCardProps> = ({ movie, className = '' }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={cardVariants}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/movies/${movie.id}`)}
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-[#161619] border border-border hover:border-[#E50914]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#E50914]/10 cursor-pointer ${className}`}
    >
      {/* Poster Image & Badges */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161619] via-transparent to-transparent opacity-80" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-border text-xs font-bold text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {movie.status === 'FEATURED' && (
            <Badge variant="primary" size="sm">
              FEATURED
            </Badge>
          )}
          {movie.status === 'NOW_SHOWING' && (
            <Badge variant="warning" size="sm">
              NOW SHOWING
            </Badge>
          )}
          {movie.status === 'COMING_SOON' && (
            <Badge variant="secondary" size="sm">
              COMING SOON
            </Badge>
          )}
        </div>

        {/* Quick Action on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center bg-gradient-to-t from-black via-black/80 to-transparent">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/booking/st-1?movieId=${movie.id}`);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#E50914]/40"
          >
            <Ticket className="w-4 h-4" />
            Book Tickets
          </button>
        </div>
      </div>

      {/* Movie Details */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-[#E50914] transition-colors">
          {movie.title}
        </h3>

        {/* Genres */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {movie.genres.slice(0, 3).join(', ')}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{formatDuration(movie.durationMinutes)}</span>
          </div>
          <span className="font-semibold text-white">
            From {formatCurrency(movie.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
