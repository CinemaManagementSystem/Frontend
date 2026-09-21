import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, SlidersHorizontal, Sparkles, Film, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';
import { SectionTabs } from '@/components/common/SectionTabs/SectionTabs';
import { DateSelector } from '@/components/common/DateSelector/DateSelector';
import { MovieGrid } from '@/components/common/MovieGrid/MovieGrid';
import { MovieCardSkeleton } from '@/components/common/Skeleton/Skeleton';
import { getCinemaDate, isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { cn } from '@/lib/utils';

type ListingTab = 'NOW_SHOWING' | 'COMING_SOON';

const dateFormatter = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

const getDateString = (date: Date) => date.toISOString().slice(0, 10);

export const MoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, showtimes, searchQuery, setSearchQuery, fetchCatalog, loading } = useMovieStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, setSearchQuery]);

  const [activeListingTab, setActiveListingTab] = useState<ListingTab>('NOW_SHOWING');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('POPULARITY');
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);

  const [genreOpen, setGenreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const today = getCinemaDate();

  const upcomingShowtimes = useMemo(() => showtimes
    .filter((showtime) => isUpcomingShowtime(showtime))
    .sort((first, second) => parseShowtimeStart(first.startTime) - parseShowtimeStart(second.startTime)),
  [showtimes]);

  const availableDates = useMemo(() => [...new Set(upcomingShowtimes.map((showtime) => showtime.date))], [upcomingShowtimes]);

  const dateCards = useMemo(() => {
    const firstDate = new Date(`${today}T12:00:00Z`);
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(firstDate);
      date.setUTCDate(firstDate.getUTCDate() + index);
      return getDateString(date);
    });
    return [...new Set([...dates, ...availableDates])].sort().map((date) => ({
      dateStr: date,
      dayName: date === today ? 'Today' : dateFormatter(date, { weekday: 'short' }),
      dayNum: dateFormatter(date, { day: 'numeric' }),
      monthName: dateFormatter(date, { month: 'short' }),
      isToday: date === today,
      hasShowtimes: availableDates.includes(date),
    }));
  }, [availableDates, today]);

  useEffect(() => {
    const firstAvailableDate = availableDates.find((date) => date >= today) ?? today;
    setSelectedDate((current) => dateCards.some((date) => date.dateStr === current) ? current : firstAvailableDate);
  }, [availableDates, dateCards, today]);

  const selectedDateShowtimes = useMemo(() => upcomingShowtimes.filter((showtime) => showtime.date === selectedDate), [selectedDate, upcomingShowtimes]);
  const selectedMovieIds = useMemo(() => new Set(selectedDateShowtimes.map((showtime) => showtime.movieId)), [selectedDateShowtimes]);

  const genres = useMemo(
    () => ['ALL', ...Array.from(new Set(movies.flatMap((movie) => movie.genres))).sort()],
    [movies],
  );

  const filteredMovies = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const hasDateListings = activeListingTab === 'NOW_SHOWING' && selectedDate !== '';

    return movies
      .filter((movie) => {
        const matchesListing = movie.status === activeListingTab || (activeListingTab === 'NOW_SHOWING' && movie.status === 'FEATURED');
        const matchesDate = !hasDateListings || selectedMovieIds.has(movie.id);
        const matchesSearch =
          !normalizedSearch ||
          movie.title.toLowerCase().includes(normalizedSearch) ||
          movie.genres.some((g) => g.toLowerCase().includes(normalizedSearch));
        const matchesGenre = selectedGenre === 'ALL' || movie.genres.includes(selectedGenre);

        return matchesListing && matchesDate && matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'RATING') return b.rating - a.rating;
        if (sortBy === 'DURATION') return b.durationMinutes - a.durationMinutes;
        return b.voteCount - a.voteCount;
      });
  }, [activeListingTab, movies, searchQuery, selectedDate, selectedMovieIds, selectedGenre, sortBy]);

  const getSortLabel = (id: string) => {
    if (id === 'RATING') return 'Rating';
    if (id === 'DURATION') return 'Duration';
    return 'Popularity';
  };

  const nowShowingCount = useMemo(() => movies.filter((m) => m.status === 'NOW_SHOWING' || m.status === 'FEATURED').length, [movies]);
  const comingSoonCount = useMemo(() => movies.filter((m) => m.status === 'COMING_SOON').length, [movies]);

  return (
    <div className="movie-listing-page pb-24 min-h-screen text-foreground">
      {/* Header & Filter Toolbar */}
      <section className="relative pt-12 pb-6">
        <div className="container-main space-y-6">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              Legend Cinema
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl text-foreground">Explore Movies</h1>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between text-card-foreground">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Find a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setGenreOpen(!genreOpen); setSortOpen(false); }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-muted-foreground transition-all hover:border-foreground/30 hover:text-foreground focus:outline-none"
                >
                  <span className="font-semibold">{selectedGenre === 'ALL' ? 'All Genres' : selectedGenre}</span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground', genreOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {genreOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setGenreOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-2 w-48 origin-top-right overflow-y-auto rounded-xl border border-border bg-card p-1 text-card-foreground shadow-2xl backdrop-blur-xl z-20 max-h-60"
                      >
                        {genres.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => { setSelectedGenre(g); setGenreOpen(false); }}
                            className={cn(
                              'w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors',
                              selectedGenre === g ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            {g === 'ALL' ? 'All Genres' : g}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setSortOpen(!sortOpen); setGenreOpen(false); }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white/60 transition-all hover:border-white/25 focus:outline-none"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-white/50" />
                  <span className="font-semibold">{getSortLabel(sortBy)}</span>
                  <ChevronDown className={cn('h-4 w-4 text-white/50', sortOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-2 w-44 origin-top-right rounded-xl border border-white/10 bg-black/95 p-1 shadow-2xl backdrop-blur-xl z-20"
                      >
                        {[
                          { id: 'POPULARITY', label: 'Popularity' },
                          { id: 'RATING', label: 'Rating' },
                          { id: 'DURATION', label: 'Duration' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => { setSortBy(item.id); setSortOpen(false); }}
                            className={cn(
                              'w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors',
                              sortBy === item.id ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-white/60 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTabs
              tabs={[
                { id: 'NOW_SHOWING', label: 'Now Showing', count: nowShowingCount },
                { id: 'COMING_SOON', label: 'Coming Soon', count: comingSoonCount },
              ]}
              activeTab={activeListingTab}
              onTabChange={(tab) => setActiveListingTab(tab as ListingTab)}
              showCounts={false}
            />
            {activeListingTab === 'NOW_SHOWING' && (
              <DateSelector
                dateList={dateCards}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                className="border-0 bg-transparent px-0 py-0"
                showLabel={false}
              />
            )}
          </div>
        </div>
      </section>

      {/* Movies Grid Section */}
      <section className="container-main pt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : filteredMovies.length > 0 ? (
          <MovieGrid
            key={`${activeListingTab}-${selectedDate}-${searchQuery}-${selectedGenre}-${sortBy}`}
            movies={filteredMovies}
            onMovieClick={(movie) => navigate(`/movies/${movie.id}`)}
            emptyMessage="No films match that selection"
          />
        ) : (
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-8 py-20 text-center">
            <Film className="mx-auto h-12 w-12 animate-pulse text-white/50" />
            <h3 className="text-lg font-black uppercase tracking-wider">No Movies Found</h3>
            <p className="mx-auto max-w-sm text-xs text-white/50">
              We couldn't find any movies matching "{searchQuery}" or selected filters. Try adjusting your search query or filters.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedGenre('ALL'); }}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/15"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Trailer Video Player Modal */}
      <AnimatePresence>
        {activeTrailerUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActiveTrailerUrl(null)}
                className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/70 p-2 text-white transition-colors hover:bg-[var(--primary)]"
                aria-label="Close trailer"
              >
                <X className="h-5 w-5" />
              </button>
              <iframe
                src={activeTrailerUrl}
                title="Movie Trailer Player"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
