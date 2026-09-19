import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { Movie, Showtime } from '@/types/movie';

interface ShowtimeResultsProps {
  showtimesByMovie: Record<string, Showtime[]>;
  movies: Movie[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
};

export const formatTime12h = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24;
  const parts = time24.split(':');
  const hour = parseInt(parts[0], 10);
  const minute = parts[1] || '00';
  if (Number.isNaN(hour)) return time24;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${ampm}`;
};

export const ShowtimeResults: React.FC<ShowtimeResultsProps> = ({
  showtimesByMovie,
  movies,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 w-full"
    >
      {Object.entries(showtimesByMovie).map(([movieId, movieShowtimes]) => {
        const movie = movies.find((m) => m.id === movieId);
        if (!movie) return null;

        // Group showtimes of this movie by Hall/Format combo
        const formatGroups: Record<
          string,
          { formatName: string; list: Showtime[] }
        > = {};

        movieShowtimes.forEach((st) => {
          const formatLabel = st.format === '2D' ? 'Standard Digital' : st.format === 'Dolby' ? 'Dolby Atmos' : st.format;
          const groupKey = `${formatLabel}-${st.hallName}`;
          if (!formatGroups[groupKey]) {
            formatGroups[groupKey] = {
              formatName: `${formatLabel} • ${st.hallName}`,
              list: [],
            };
          }
          formatGroups[groupKey].list.push(st);
        });

        return (
          <motion.div
            key={movie.id}
            variants={itemVariants}
            className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row gap-6 hover:border-[#E50914]/40 transition-all duration-300 group/card"
          >
            {/* Movie Poster & Meta */}
            <div className="w-full md:w-44 shrink-0 space-y-3">
              <div
                onClick={() => navigate(`/movies/${movie.id}`)}
                className="relative overflow-hidden rounded-xl border border-border shadow-lg shadow-black/40 cursor-pointer aspect-[2/3]"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
              </div>

              <div className="space-y-1.5 hidden md:block">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'} / 10</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{movie.durationMinutes} mins</span>
                </div>
              </div>
            </div>

            {/* Movie Details & Showtimes */}
            <div className="flex-1 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4
                      onClick={() => navigate(`/movies/${movie.id}`)}
                      className="text-xl sm:text-2xl font-black text-foreground hover:text-[#E50914] cursor-pointer transition-colors uppercase tracking-tight"
                    >
                      {movie.title}
                    </h4>
                    <p className="text-xs mt-1 uppercase font-bold tracking-wider text-[#E50914]">
                      {movie.genres.join(' • ')}
                    </p>
                  </div>
                </div>

                {movie.description && (
                  <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
                    {movie.description}
                  </p>
                )}
              </div>

              {/* Showtimes by Format Groups */}
              <div className="space-y-4 pt-3 border-t border-border/60">
                {Object.values(formatGroups).map((group) => (
                  <div key={group.formatName} className="space-y-2">
                    <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {group.formatName}
                    </span>

                    <div className="flex flex-wrap gap-2.5">
                      {group.list
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((st) => {
                          const totalSeats = 80;
                          const occupiedCount = st.occupiedSeats?.length || 0;
                          const occupancyPercent = (occupiedCount / totalSeats) * 100;
                          const isSoldOut = occupiedCount >= totalSeats;

                          let statusColor = 'bg-emerald-500';
                          let occupancyLabel = 'Available';

                          if (isSoldOut) {
                            statusColor = 'bg-rose-500';
                            occupancyLabel = 'SOLD OUT';
                          } else if (occupancyPercent >= 75) {
                            statusColor = 'bg-amber-500';
                            occupancyLabel = 'ALMOST FULL';
                          }

                          return (
                            <motion.button
                              key={st.id}
                              disabled={isSoldOut}
                              onClick={() =>
                                navigate(`/booking/${st.id}?movieId=${movie.id}`)
                              }
                              whileHover={isSoldOut ? {} : { scale: 1.05 }}
                              whileTap={isSoldOut ? {} : { scale: 0.95 }}
                              className={`group/btn relative flex min-w-[100px] sm:min-w-[110px] flex-col items-center justify-center rounded-2xl border p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${
                                isSoldOut
                                  ? 'cursor-not-allowed border-transparent bg-muted/30 opacity-40'
                                  : 'cursor-pointer border-border/80 bg-card hover:border-[#E50914] hover:bg-[#E50914]/5 shadow-sm'
                              }`}
                              title={`${occupancyLabel} (${occupiedCount}/${totalSeats} seats) - $${st.price.toFixed(2)}`}
                            >
                              {isSoldOut ? (
                                <>
                                  <span className="text-sm font-black text-muted-foreground line-through">
                                    {formatTime12h(st.time)}
                                  </span>
                                  <span className="text-[8px] font-bold text-rose-500 mt-1 tracking-wider">
                                    SOLD OUT
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-black text-foreground group-hover/btn:text-[#E50914] transition-colors">
                                    {formatTime12h(st.time)}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                      ${st.price.toFixed(2)}
                                    </span>
                                  </div>

                                  {/* Occupancy Indicator Bar */}
                                  <div className="w-12 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                                    <div
                                      className={`h-full ${statusColor}`}
                                      style={{
                                        width: `${Math.max(15, occupancyPercent)}%`,
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                            </motion.button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
