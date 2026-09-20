import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Showtime } from '@/types/movie';
import { isUpcomingShowtime } from '@/lib/showtime';

interface ShowtimeGroup {
  cinemaId: string;
  cinemaName: string;
  hallName: string;
  format: string;
  language: string;
  shows: Showtime[];
}

interface ShowtimeListProps {
  groups: ShowtimeGroup[];
  onBookShowtime: (showtime: Showtime) => void;
  className?: string;
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

export const ShowtimeList: React.FC<ShowtimeListProps> = ({
  groups,
  onBookShowtime,
  className = '',
}) => {
  const [openCinemas, setOpenCinemas] = useState<Set<string>>(new Set(groups.map(g => g.cinemaId)));

  useEffect(() => {
    setOpenCinemas((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const group of groups) {
        if (!next.has(group.cinemaId)) {
          next.add(group.cinemaId);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [groups]);

  const toggleCinema = (cinemaId: string) => {
    setOpenCinemas(prev => {
      const next = new Set(prev);
      if (next.has(cinemaId)) next.delete(cinemaId);
      else next.add(cinemaId);
      return next;
    });
  };

  return (
    <div className={cn('space-y-4', className)} role="region" aria-label="Showtimes">
      {groups.map((group) => {
        const isOpen = openCinemas.has(group.cinemaId);
        const upcomingShows = group.shows.filter(isUpcomingShowtime);

        return (
          <article key={`${group.cinemaId}-${group.hallName}-${group.format}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={() => toggleCinema(group.cinemaId)}
              className="cinema-accordion-header"
              aria-expanded={isOpen}
              aria-controls={`showtimes-${group.cinemaId}-${group.hallName}`}
            >
              <span className="text-base font-bold text-white">{group.cinemaName}</span>
              <ChevronDown className={cn('cinema-accordion-chevron', isOpen && 'cinema-accordion-chevron-open')} aria-hidden="true" />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={`showtimes-${group.cinemaId}-${group.hallName}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-white/10 p-4 pt-5"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={cn(getFormatBadgeClass(group.format))}>
                      {group.format.toUpperCase()}
                    </span>
                    <span className="hall-label">{group.hallName}</span>
                    <span className="lang-tag">{group.language}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {upcomingShows.map((show) => (
                      <button
                        key={show.id}
                        type="button"
                        onClick={() => onBookShowtime(show)}
                        disabled={!isUpcomingShowtime(show)}
                        aria-label={`${show.time} - Reserve`}
                        className="time-slot-pill"
                      >
                        {formatTime12h(show.time)}
                      </button>
                    ))}
                    {upcomingShows.length === 0 && (
                      <span className="text-sm text-white/40">No upcoming shows</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
};
