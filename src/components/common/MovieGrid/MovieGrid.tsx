import React from 'react';
import { MovieCard } from '../MovieCard/MovieCard';
import { Movie } from '@/types/movie';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MovieGridProps {
  movies: Movie[];
  className?: string;
  emptyMessage?: string;
  onMovieClick?: (movie: Movie) => void;
  variant?: 'default' | 'home';
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  className = '',
  emptyMessage = 'No films match that selection',
  onMovieClick,
  variant = 'default',
}) => {
  if (movies.length === 0) {
    return (
      <div className={cn('mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-12 text-center', className)}>
        <svg className="mx-auto h-8 w-8 text-white/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 8h20"/><path d="M2 16h20"/><path d="M8 2v20"/><path d="M16 2v20"/></svg>
        <h2 className="mt-4 text-lg font-bold text-white">{emptyMessage}</h2>
        <p className="mt-2 text-sm text-white/45">Try another date, tab, or search term.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6', className)}
      role="list"
      aria-label="Movie listings"
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} variant={variant} onClick={() => onMovieClick?.(movie)} />
      ))}
    </motion.div>
  );
};
