import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Compass, Play, Search, Star, Ticket } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';
import { MovieCard } from '@/components/ui/Card/MovieCard';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { formatDuration } from '@/utils/formatDate';
import type { Movie } from '@/types/movie';

type ListingTab = 'NOW_SHOWING' | 'COMING_SOON';

const getMovieStatusLabel = (status: Movie['status']) => {
  if (status === 'COMING_SOON') return 'Coming Soon';
  if (status === 'FEATURED') return 'Featured';
  return 'Now Showing';
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, showtimes, searchQuery, setSearchQuery, fetchCatalog } = useMovieStore();
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [activeListingTab, setActiveListingTab] = useState<ListingTab>('NOW_SHOWING');
  const [activeDateIndex, setActiveDateIndex] = useState(0);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const featuredMovies = useMemo(() => {
    const priority = ['FEATURED', 'NOW_SHOWING', 'COMING_SOON'] as const;

    return priority
      .flatMap((status) => movies.filter((movie) => movie.status === status))
      .filter((movie, index, allMovies) => allMovies.findIndex((item) => item.id === movie.id) === index)
      .slice(0, 6);
  }, [movies]);

  const featuredMovie = featuredMovies[activeSlide] ?? featuredMovies[0];

  const dateCards = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);

      return {
        id: date.toISOString(),
        label: index === 0 ? 'Today' : new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
        day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
      };
    });
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const matchesListing =
      movie.status === activeListingTab || (activeListingTab === 'NOW_SHOWING' && movie.status === 'FEATURED');
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      movie.title.toLowerCase().includes(normalizedSearch) ||
      movie.genres.some((genre) => genre.toLowerCase().includes(normalizedSearch));

    return matchesListing && matchesSearch;
  });

  useEffect(() => {
    setActiveSlide((current) => Math.min(current, Math.max(featuredMovies.length - 1, 0)));
  }, [featuredMovies.length]);

  useEffect(() => {
    if (isHeroPaused || featuredMovies.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredMovies.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [featuredMovies.length, isHeroPaused]);

  const scrollToReviews = () => {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWatchTrailer = (url?: string) => {
    if (!url) return;
    setActiveTrailerUrl(url);
    setTrailerModalOpen(true);
  };

  const getBookingPath = (movieId: string) => {
    const matchingShowtime = showtimes.find((showtime) => showtime.movieId === movieId);
    return matchingShowtime ? `/booking/${matchingShowtime.id}?movieId=${movieId}` : `/movies/${movieId}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {featuredMovie && (
        <section
          className="relative isolate overflow-hidden border-b border-border/80 bg-[#06080b]"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          aria-roledescription="carousel"
          aria-label="Featured Cinematique movies"
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={featuredMovie.id}
              className="absolute inset-0 -z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            >
              <motion.img
                src={featuredMovie.backdropUrl}
                alt=""
                initial={{ scale: 1.1 }}
                animate={{ scale: 1.03 }}
                transition={{ duration: 8, ease: 'linear' }}
                className="h-full w-full object-cover opacity-50 blur-sm"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#101923]/85 via-[#16080a]/65 to-background" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-background via-background/90 to-transparent" />

          <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8 lg:pb-14 lg:pt-14">
            <div className="mx-auto max-w-5xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={featuredMovie.id}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.985 }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                  className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#071016]/90 shadow-2xl shadow-black/40"
                  aria-live="polite"
                >
                  <img src={featuredMovie.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/5" />

                  <div className="relative grid min-h-[360px] items-end gap-6 p-6 sm:min-h-[470px] sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="max-w-xl space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary" size="md">
                          {getMovieStatusLabel(featuredMovie.status)}
                        </Badge>
                        <Badge variant="secondary" size="md">
                          PG-13
                        </Badge>
                        <button
                          type="button"
                          onClick={scrollToReviews}
                          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/45 px-3 py-1 text-xs font-black text-amber-300 backdrop-blur transition hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                          aria-label={`View reviews for ${featuredMovie.title}`}
                        >
                          <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                          {featuredMovie.rating.toFixed(1)}
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                          <Clock className="h-3.5 w-3.5 text-slate-300" />
                          {formatDuration(featuredMovie.durationMinutes)}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#E50914]">
                          Featured at Cinematique
                        </p>
                        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white drop-shadow-2xl sm:text-6xl">
                          {featuredMovie.title}
                        </h1>
                      </div>

                      <p className="max-w-lg text-sm font-medium leading-7 text-slate-100/90 sm:text-base">
                        {featuredMovie.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(getBookingPath(featuredMovie.id))}
                          className="inline-flex items-center gap-2 rounded-full bg-[#E50914] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-xl shadow-[#E50914]/35 transition hover:scale-[1.03] hover:bg-[#ff1f2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#E50914]"
                        >
                          <Ticket className="h-4 w-4" />
                          Book Now
                        </button>

                        {featuredMovie.trailerUrl && (
                          <button
                            type="button"
                            onClick={() => handleWatchTrailer(featuredMovie.trailerUrl)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                          >
                            <Play className="h-4 w-4 fill-[#E50914] text-[#E50914]" />
                            Watch Trailer
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="hidden justify-end lg:flex">
                      <motion.img
                        src={featuredMovie.posterUrl}
                        alt={`${featuredMovie.title} poster`}
                        initial={{ rotate: -2 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 0.4 }}
                        className="h-[360px] w-64 rounded-2xl border border-white/20 object-cover shadow-2xl shadow-black/60"
                      />
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>

              {featuredMovies.length > 1 && (
                <div className="mt-4 flex justify-center gap-2" aria-label="Choose featured promotion">
                  {featuredMovies.map((movie, index) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Show ${movie.title}`}
                      aria-current={index === activeSlide ? 'true' : undefined}
                      className="group rounded-full p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          index === activeSlide ? 'w-8 bg-[#E50914]' : 'w-2 bg-white/35 group-hover:bg-white/75'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="movies" className="mx-auto max-w-7xl space-y-8 px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveListingTab('NOW_SHOWING')}
              className={`text-left text-2xl font-black tracking-tight transition sm:text-3xl cursor-pointer ${
                activeListingTab === 'NOW_SHOWING' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Now Showing
            </button>
            <span className="text-2xl font-light text-zinc-700">|</span>
            <button
              type="button"
              onClick={() => setActiveListingTab('COMING_SOON')}
              className={`text-left text-2xl font-black tracking-tight transition sm:text-3xl cursor-pointer ${
                activeListingTab === 'COMING_SOON' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Coming Soon
            </button>
          </div>

          <label className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search movies..."
              className="h-10 w-full rounded-full border border-zinc-800 bg-zinc-900/90 pl-9 pr-4 text-xs font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]"
            />
          </label>
        </div>

        <div className="no-scrollbar flex items-center gap-2.5 overflow-x-auto py-1">
          {dateCards.map((date, index) => {
            const active = activeDateIndex === index;

            return (
              <button
                key={date.id}
                type="button"
                onClick={() => setActiveDateIndex(index)}
                className={`flex min-w-[96px] shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center transition-all cursor-pointer ${
                  active
                    ? 'border-[#E50914] bg-black text-white shadow-lg shadow-[#E50914]/20 ring-1 ring-[#E50914]'
                    : 'border-zinc-800/80 bg-zinc-900/90 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">{date.label}</span>
                <span className="mt-0.5 block text-xl font-black leading-none text-white">{date.day}</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">{date.month}</span>
              </button>
            );
          })}
        </div>

        {filteredMovies.length > 0 ? (
          <motion.div
            key={`${activeListingTab}-${searchQuery}`}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4"
          >
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Compass className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />
            <h3 className="mt-4 text-base font-black text-foreground">No Movies Found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              No movies match your search for this tab. Try another keyword or switch the movie listing.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-5 rounded-full bg-[#E50914] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#ff1f2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#E50914]"
            >
              Reset Search
            </button>
          </div>
        )}
      </section>

      <section id="reviews" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#E50914]">Audience ratings</p>
              <h2 className="mt-1 text-2xl font-black text-foreground">What moviegoers are watching</h2>
              <p className="mt-2 text-sm text-muted-foreground">Tap a movie rating in the hero to jump here.</p>
            </div>
            {featuredMovie && (
              <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-amber-400">
                <Star className="h-5 w-5 fill-amber-400" />
                <span className="text-lg font-black">{featuredMovie.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 10 community rating</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-muted via-card to-muted p-8 shadow-xl dark:from-[#1a1a1e] dark:via-[#141416] dark:to-[#1a1112] dark:shadow-black/40 sm:p-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#E50914]">Experience the best</span>
            <h3 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              World-class cinematic technology
            </h3>
            <p className="text-sm text-muted-foreground">
              Immersive screens, precision sound, and premium seating designed for a smoother night at the movies.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ['IMAX 3D Laser', 'Next-generation projection with richer contrast and scale.', 'text-[#E50914]'],
              ['Dolby Atmos Audio', 'Multi-dimensional sound that moves around the room.', 'text-amber-500 dark:text-amber-400'],
              ['VIP Suite Recliners', 'Relaxed premium seating with extra comfort and service.', 'text-slate-900 dark:text-slate-100'],
            ].map(([title, description, colorClass]) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-[#E50914]/40 hover:shadow-lg hover:shadow-[#E50914]/10"
              >
                <span className={`block text-lg font-black ${colorClass}`}>
                  {title}
                </span>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        maxWidth="2xl"
        title="Movie Trailer"
      >
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {activeTrailerUrl && (
            <iframe
              src={activeTrailerUrl}
              title="YouTube video player"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
