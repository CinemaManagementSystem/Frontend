import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Calendar,
  Clock,
  Film,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatDuration, formatDate } from '@/utils/formatDate';
import { isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export const ShowcasePage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, loading, fetchAll } = useMovieAdminStore();
  const { categories, fetchAll: fetchCategories } = useCategoryStore();
  const { showtimes, fetchCatalog } = useMovieStore();
  const catalogRequiresSignIn = !useAuthStore((state) => state.isAuthenticated);
  const { cinemas, selectedCinemaId, selectCinema } = useCinemaStore();
  const selectedCinemaName = cinemas.find((cinema) => cinema.id === selectedCinemaId)?.name || 'your selected cinema';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');
  const [activeMovie, setActiveMovie] = useState<number | null>(null);
  const now = useShowtimeClock();

  useEffect(() => {
    void fetchAll();
    void fetchCategories();
    void fetchCatalog();
  }, [fetchAll, fetchCategories, fetchCatalog]);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? `#${id}`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movies.filter((m) => {
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || m.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [movies, search, statusFilter, categoryFilter]);

  const movieShows = (movieId: number) =>
    showtimes.filter((s) => s.movieId === `m-${movieId}` && isUpcomingShowtime(s, now) &&
      (selectedCinemaId === 'ALL' || s.cinemaId === selectedCinemaId))
      .sort((a, b) => parseShowtimeStart(a.startTime) - parseShowtimeStart(b.startTime));

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'NOW_SHOWING', label: 'Now Showing' },
    { value: 'COMING_SOON', label: 'Coming Soon' },
    { value: 'ENDED', label: 'Ended' },
  ];

  return (
    <div className="pb-24 bg-background min-h-screen text-foreground selection:bg-[var(--primary)]">
      {/* Hero */}
      <section className="relative w-full py-16 overflow-hidden border-b border-border bg-card/60">
        <PageContainer className="space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Live From The API
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground uppercase tracking-tight">
            Movie Showcase
          </h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            This catalog is fetched live from <code className="text-[var(--primary)]">GET /api/movies</code>{' '}
            combined with <code className="text-[var(--primary)]">GET /api/shows</code> and
            <code className="text-[var(--primary)]"> /api/movie-category</code> — no mock data.
          </p>
        </PageContainer>
      </section>

      {/* Filters */}
      <PageContainer as="section" className="py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Showtimes: {selectedCinemaId === 'ALL' ? 'All cinemas' : selectedCinemaName}</span>
          {selectedCinemaId !== 'ALL' && <button type="button" onClick={() => selectCinema('ALL')} className="font-semibold text-primary underline underline-offset-4">View all cinemas</button>}
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or genre..."
              className="w-full bg-card border border-border text-foreground text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[var(--primary)] transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                  statusFilter === opt.value
                    ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <select
              value={String(categoryFilter)}
              onChange={(e) =>
                setCategoryFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="bg-card border border-border text-foreground text-xs rounded-xl px-4 py-2.5 outline-none focus:border-[var(--primary)]"
            >
              <option value="ALL" className="bg-card text-foreground">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filtered.length}</span> of{' '}
          {movies.length} movies
        </p>
      </PageContainer>

      {/* Catalog */}
      <PageContainer as="section">
        {loading ? (
          <div className="py-24 text-center text-muted-foreground text-sm">Loading live catalog…</div>
        ) : filtered.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((movie) => {
              const showList = movieShows(movie.id);
              const hasShows = showList.length > 0;
              return (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-card border border-border hover:border-[var(--primary)]/40 hover:shadow-2xl hover:shadow-[var(--primary)]/10 transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0.2';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge
                        variant={
                          movie.status === 'NOW_SHOWING'
                            ? 'warning'
                            : movie.status === 'COMING_SOON'
                              ? 'secondary'
                              : 'destructive'
                        }
                        size="sm"
                      >
                        {movie.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-foreground text-base uppercase tracking-tight leading-snug line-clamp-1">
                        {movie.title}
                      </h3>
                      <span className="text-[10px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                        {categoryName(movie.categoryId)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
                      {movie.genre}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {formatDuration(movie.durationMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {formatDate(movie.releaseDate)}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 line-clamp-3 leading-relaxed flex-1">
                      {movie.description || 'No synopsis available.'}
                    </p>

                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
                      {catalogRequiresSignIn ? (
                        <Link to={`/login?redirect=${encodeURIComponent('/showcase')}`} className="text-xs font-semibold text-primary underline underline-offset-4">Sign in to view showtimes</Link>
                      ) : hasShows ? (
                        <button
                          onClick={() => setActiveMovie(activeMovie === movie.id ? null : movie.id)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[var(--primary)]/30"
                        >
                          <Ticket className="w-4 h-4" />
                          {activeMovie === movie.id ? 'Hide Showtimes' : `View Showtimes (${showList.length})`}
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          {selectedCinemaId === 'ALL' ? 'No upcoming showtimes yet' : `No upcoming showtimes at ${selectedCinemaName}`}
                        </span>
                      )}
                    </div>

                    <AnimatePresence>
                      {activeMovie === movie.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 space-y-2">
                            {showList.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  if (isUpcomingShowtime(s)) navigate(`/booking/${s.id}?movieId=m-${movie.id}`);
                                  else void fetchCatalog();
                                }}
                                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-accent/40 border border-border hover:border-[var(--primary)]/40 hover:bg-accent transition-all"
                              >
                                <span className="text-xs text-foreground">
                                  {formatDate(`${s.date}T12:00:00`)} at {s.time}
                                  <span className="mt-1 block text-[10px] text-muted-foreground">{s.cinemaName} · {s.hallName}</span>
                                </span>
                                <Badge variant={s.status === 'IN_PROGRESS' ? 'warning' : 'outline'} size="sm">
                                  {s.status.replace('_', ' ')}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-24 text-center bg-card border border-border rounded-3xl p-8 space-y-4">
            <Film className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
            <h3 className="text-lg font-black text-foreground uppercase tracking-wider">No Movies Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-all"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
      </PageContainer>
    </div>
  );
};
