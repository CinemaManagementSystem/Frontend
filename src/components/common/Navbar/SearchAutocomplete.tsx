import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';
import { cn } from '@/lib/utils';
import type { Movie } from '@/types/movie';

const STATUS_LABEL: Record<Movie['status'], string> = {
  NOW_SHOWING: 'Now Showing',
  COMING_SOON: 'Coming Soon',
  FEATURED: 'Featured',
};

const STATUS_STYLE: Record<Movie['status'], string> = {
  NOW_SHOWING: 'text-emerald-600 dark:text-emerald-300',
  COMING_SOON: 'text-amber-600 dark:text-amber-300',
  FEATURED: 'text-[var(--primary)] dark:text-[var(--primary)]',
};

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  onSelect: (movieId: string) => void;
  size?: 'sm' | 'lg';
  autoFocus?: boolean;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSubmit,
  onSelect,
  size = 'lg',
  autoFocus = false,
}) => {
  const movies = useMovieStore((state) => state.movies);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const trimmed = value.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!trimmed) return [];
    const priority: Record<Movie['status'], number> = { FEATURED: 0, NOW_SHOWING: 1, COMING_SOON: 2 };

    return movies
      .filter(
        (movie) =>
          movie.title.toLowerCase().includes(trimmed) ||
          movie.genres.some((genre) => genre.toLowerCase().includes(trimmed)),
      )
      .sort((a, b) => {
        const byStatus = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
        if (byStatus !== 0) return byStatus;
        return b.rating - a.rating;
      })
      .slice(0, 6);
  }, [movies, trimmed]);

  useEffect(() => {
    if (!open) setActiveIndex(-1);
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % Math.max(suggestions.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = suggestions[activeIndex];
      if (active) {
        onSelect(active.id);
      } else {
        onSubmit(value);
      }
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const heightClass = size === 'lg' ? 'h-12' : 'h-10';

  return (
    <div ref={containerRef} className="relative">
      <label className="relative block">
        <Search className="search-pill-icon" />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          placeholder="Search Movies..."
          aria-label="Search movies"
          aria-expanded={open}
          className={cn(
            'search-pill',
            heightClass,
          )}
        />
      </label>

      <AnimatePresence>
        {open && trimmed && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl p-2 text-white shadow-2xl dark:shadow-black/50"
          >
            {suggestions.length > 0 && (
              <ul className="max-h-[360px] overflow-y-auto">
                {suggestions.map((movie, index) => (
                  <li key={movie.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(movie.id);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition',
                        index === activeIndex ? 'bg-white/10' : 'hover:bg-white/5',
                      )}
                    >
                      <img
                        src={movie.posterUrl}
                        alt=""
                        className="h-14 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-bold text-white">{movie.title}</span>
                          <span className={cn('text-[10px] font-black uppercase tracking-wider', STATUS_STYLE[movie.status])}>
                            {STATUS_LABEL[movie.status]}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/50">
                          <span>{movie.genres.slice(0, 2).join(' / ')}</span>
                          {movie.rating > 0 && (
                            <span className="inline-flex items-center gap-1 text-amber-300">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              {movie.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {suggestions.length === 0 && (
              <p className="px-3 py-2 text-xs text-white/50">No movies match "{value}".</p>
            )}
            <button
              type="button"
              onClick={() => {
                onSubmit(value);
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-t border-white/10 px-3 py-2.5 text-xs font-bold text-[var(--primary)] transition hover:bg-white/5"
            >
              <Search className="h-3.5 w-3.5" />
              See all results for "{value}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
