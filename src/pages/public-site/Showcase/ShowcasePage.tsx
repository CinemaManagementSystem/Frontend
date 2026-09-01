import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Calendar,
  Clock,
  Film,
  Sparkles,
  Ticket,
  X,
  Globe,
} from 'lucide-react';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useShowStore } from '@/store/showStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatDuration, formatDateTime, formatDate } from '@/utils/formatDate';

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
  const { shows, fetchAll: fetchShows } = useShowStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');
  const [activeMovie, setActiveMovie] = useState<number | null>(null);

  useEffect(() => {
    void fetchAll();
    void fetchCategories();
    void fetchShows();
  }, [fetchAll, fetchCategories, fetchShows]);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? `#${id}`;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return movies.filter((m) => {
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.genre.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || m.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [movies, search, statusFilter, categoryFilter]);

  const movieShows = (movieId: number) =>
    shows.filter((s) => s.movieId === movieId && s.status !== 'CANCELLED');

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'NOW_SHOWING', label: 'Now Showing' },
    { value: 'COMING_SOON', label: 'Coming Soon' },
    { value: 'ENDED', label: 'Ended' },
  ];

  return (
    <div className="pb-24 bg-[#0f0f10] min-h-screen text-white selection:bg-[#E50914]">
      {/* Hero */}
      <section className="relative w-full py-16 overflow-hidden border-b border-white/5 bg-gradient-to-b from-zinc-900 to-[#0f0f10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Live From The API
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Movie Showcase
          </h1>
          <p className="text-xs text-gray-400 max-w-2xl">
            This catalog is fetched live from <code className="text-[#E50914]">GET /api/movies</code>{' '}
            combined with <code className="text-[#E50914]">GET /api/shows</code> and
            <code className="text-[#E50914]"> /api/movie-category</code> — no mock data.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, genre or language..."
              className="w-full bg-[#18181b] border border-white/10 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#E50914] transition-colors placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                  statusFilter === opt.value
                    ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30'
                    : 'bg-[#18181b] text-gray-400 hover:text-white border border-white/5'
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
              className="bg-[#18181b] border border-white/10 text-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-[#E50914]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          Showing <span className="text-white font-bold">{filtered.length}</span> of{' '}
          {movies.length} movies
        </p>
      </section>

      {/* Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center text-gray-400 text-sm">Loading live catalog…</div>
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
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-[#141417] border border-white/10 hover:border-[#E50914]/40 hover:shadow-2xl hover:shadow-[#E50914]/10 transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0.2';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-transparent to-transparent" />

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

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-300">
                        {movie.language}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-white text-base uppercase tracking-tight leading-snug line-clamp-1">
                        {movie.title}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-500 shrink-0 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {categoryName(movie.categoryId)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
                      {movie.genre}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#E50914]" />
                        {formatDuration(movie.durationMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#E50914]" />
                        {formatDate(movie.releaseDate)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 mt-4 line-clamp-3 leading-relaxed flex-1">
                      {movie.description || 'No synopsis available.'}
                    </p>

                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/5">
                      {hasShows ? (
                        <button
                          onClick={() => setActiveMovie(activeMovie === movie.id ? null : movie.id)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#E50914]/30"
                        >
                          <Ticket className="w-4 h-4" />
                          {activeMovie === movie.id ? 'Hide Showtimes' : `View Showtimes (${showList.length})`}
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">
                          No active showtimes yet
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
                                onClick={() => navigate(`/booking/${s.id}?movieId=${movie.id}`)}
                                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#E50914]/40 hover:bg-white/10 transition-all"
                              >
                                <span className="text-xs text-gray-300">
                                  {formatDateTime(s.startTime)}
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
          <div className="py-24 text-center bg-[#141417] border border-white/10 rounded-3xl p-8 space-y-4">
            <Film className="w-12 h-12 text-gray-500 mx-auto animate-pulse" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">No Movies Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
