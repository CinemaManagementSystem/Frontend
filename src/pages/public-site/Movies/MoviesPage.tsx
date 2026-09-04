import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Star, Play, Plus, Check, ChevronDown, SlidersHorizontal, Sparkles, Film, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

export const MoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { movies, searchQuery, setSearchQuery } = useMovieStore();

  // Filters State
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('POPULARITY');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState<string | null>(null);

  // Dropdown UI States
  const [genreOpen, setGenreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Load Watchlist from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('cinematique_watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing watchlist', e);
      }
    }
  }, []);

  const toggleWatchlist = (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    let updated = [...watchlist];
    if (watchlist.includes(movieId)) {
      updated = updated.filter((id) => id !== movieId);
    } else {
      updated.push(movieId);
    }
    setWatchlist(updated);
    localStorage.setItem('cinematique_watchlist', JSON.stringify(updated));
  };

  // Collect all unique genres from movies list
  const genres = ['ALL', ...Array.from(new Set(movies.flatMap((m) => m.genres)))];
  const languages = ['ALL', 'English', 'Spanish', 'French'];

  // Map languages dynamically to movie IDs for filtering
  const getMovieLanguage = (movieId: string): string => {
    if (movieId === 'm-7') return 'Spanish';
    if (movieId === 'm-2') return 'Spanish'; // The Last Oasis has Spanish sub/dub
    return 'English';
  };

  // Filter and Sort movies
  const filteredMovies = movies
    .filter((movie) => {
      // Category matches (we want NOW_SHOWING and COMING_SOON both, matching explore page)
      const matchesSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGenre = selectedGenre === 'ALL' || movie.genres.includes(selectedGenre);

      const matchesLanguage =
        selectedLanguage === 'ALL' || getMovieLanguage(movie.id) === selectedLanguage;

      return matchesSearch && matchesGenre && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === 'RATING') {
        return b.rating - a.rating;
      }
      if (sortBy === 'DURATION') {
        return b.durationMinutes - a.durationMinutes;
      }
      // POPULARITY (by voteCount)
      return b.voteCount - a.voteCount;
    });

  const getSortLabel = (id: string) => {
    if (id === 'RATING') return 'Rating';
    if (id === 'DURATION') return 'Duration';
    return 'Popularity';
  };

  return (
    <div className="pb-24 bg-[#0f0f10] min-h-screen text-white selection:bg-[#E50914]">
      {/* Search & Header Section */}
      <section className="relative pt-12 pb-6 bg-gradient-to-b from-zinc-900 to-[#0f0f10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-[#E50914] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              CINEMATIQUE IMMERSIVE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Explore Movies
            </h1>
          </div>

          {/* Premium Filter Toolbar matching mockup */}
          <div className="bg-zinc-900/40 border border-border backdrop-blur-md rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-2xl relative z-30">
            {/* Find a movie search input */}
            <div className="relative w-full md:flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Find a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/80 border border-border text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#E50914] transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Selector Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Genres Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setGenreOpen(!genreOpen);
                    setLangOpen(false);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 bg-zinc-950/80 border border-border text-muted-foreground text-xs rounded-xl px-4 py-2.5 hover:border-border transition-all focus:outline-none"
                >
                  <span className="font-semibold">
                    {selectedGenre === 'ALL' ? 'All Genres' : selectedGenre}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                        className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-950 border border-border p-1 shadow-2xl z-20 max-h-60 overflow-y-auto origin-top-right"
                      >
                        {genres.map((g) => (
                          <button
                            key={g}
                            onClick={() => {
                              setSelectedGenre(g);
                              setGenreOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-white/5 ${
                              selectedGenre === g ? 'text-[#E50914] bg-[#E50914]/5' : 'text-muted-foreground'
                            }`}
                          >
                            {g === 'ALL' ? 'All Genres' : g}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setLangOpen(!langOpen);
                    setGenreOpen(false);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 bg-zinc-950/80 border border-border text-muted-foreground text-xs rounded-xl px-4 py-2.5 hover:border-border transition-all focus:outline-none"
                >
                  <span className="font-semibold">
                    {selectedLanguage === 'ALL' ? 'Language' : selectedLanguage}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-2 w-40 rounded-xl bg-zinc-950 border border-border p-1 shadow-2xl z-20 origin-top-right"
                      >
                        {languages.map((l) => (
                          <button
                            key={l}
                            onClick={() => {
                              setSelectedLanguage(l);
                              setLangOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-white/5 ${
                              selectedLanguage === l ? 'text-[#E50914] bg-[#E50914]/5' : 'text-muted-foreground'
                            }`}
                          >
                            {l === 'ALL' ? 'Language' : l}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setSortOpen(!sortOpen);
                    setGenreOpen(false);
                    setLangOpen(false);
                  }}
                  className="flex items-center gap-2 bg-zinc-950/80 border border-border text-muted-foreground text-xs rounded-xl px-4 py-2.5 hover:border-border transition-all focus:outline-none"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold">{getSortLabel(sortBy)}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                        className="absolute right-0 mt-2 w-44 rounded-xl bg-zinc-950 border border-border p-1 shadow-2xl z-20 origin-top-right"
                      >
                        {[
                          { id: 'POPULARITY', label: 'Popularity' },
                          { id: 'RATING', label: 'Rating' },
                          { id: 'DURATION', label: 'Duration' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSortBy(item.id);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-white/5 ${
                              sortBy === item.id ? 'text-[#E50914] bg-[#E50914]/5' : 'text-muted-foreground'
                            }`}
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
        </div>
      </section>

      {/* Movies Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {filteredMovies.length > 0 ? (
          <motion.div 
            key={selectedGenre + selectedLanguage + sortBy + searchQuery}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredMovies.map((movie) => {
              const inWatchlist = watchlist.includes(movie.id);
              return (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  whileHover={shouldReduceMotion ? {} : { y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/movies/${movie.id}`)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#141417] border border-border hover:border-[#E50914]/40 hover:shadow-xl hover:shadow-[#E50914]/5 transition-all duration-300 cursor-pointer h-full"
                >
                  {/* Poster Image Area */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141417] via-transparent to-transparent opacity-90" />

                    {/* Star Rating Badge - Top Left inside image viewport */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-border text-[11px] font-black text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>

                    {/* Coming Soon Poster Banner */}
                    {movie.status === 'COMING_SOON' && (
                      <div className="absolute bottom-3 inset-x-0 mx-auto w-fit px-3 py-1 rounded-md bg-[#E50914] text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#E50914]/30">
                        Coming Soon
                      </div>
                    )}

                    {/* High-Fidelity Hover Information Panel */}
                    <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 z-10">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-black text-white uppercase tracking-tight leading-snug">
                            {movie.title}
                          </h4>
                          <span className="text-[10px] font-black text-amber-400 shrink-0">
                            ★ {movie.rating.toFixed(1)}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5">
                          2024 • {movie.genres.join('/')} • {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                        </p>

                        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed line-clamp-4">
                          {movie.description || 'No description available for this title. Check showtimes or view full movie details.'}
                        </p>
                      </div>

                      {/* Interactive Buttons matching Mockup */}
                      <div className="space-y-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (movie.trailerUrl) {
                              setActiveTrailerUrl(movie.trailerUrl);
                            } else {
                              navigate(`/movies/${movie.id}`);
                            }
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#E50914]/20 transition-all hover:scale-102"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Watch Now</span>
                        </button>

                        <button
                          onClick={(e) => toggleWatchlist(e, movie.id)}
                          className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            inWatchlist
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : 'border-border hover:bg-white/5 text-muted-foreground hover:text-white'
                          }`}
                        >
                          {inWatchlist ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add To List</span>
                            </>
                          )}
                        </button>

                        {/* Trailer link */}
                        <div className="text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/movies/${movie.id}`);
                            }}
                            className="text-[10px] font-black text-muted-foreground hover:text-[#E50914] uppercase tracking-widest transition-colors"
                          >
                            Movie Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Movie Info below Poster */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1 group-hover:text-[#E50914] transition-colors leading-tight uppercase">
                      {movie.title}
                    </h3>
                    
                    {/* Genres subtext */}
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      {movie.genres.join(', ')}
                    </p>

                    {/* Duration details */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{movie.durationMinutes} MIN</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Empty Search State */
          <div className="py-20 text-center bg-[#141417] border border-border rounded-3xl p-8 space-y-4">
            <Film className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
            <h3 className="text-lg font-black text-white uppercase tracking-wider">No Movies Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any movies matching "{searchQuery}" or selected filters. Try adjusting your search query or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('ALL');
                setSelectedLanguage('ALL');
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
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
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-4xl aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-border shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveTrailerUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-border text-white hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <iframe
                src={activeTrailerUrl}
                title="Movie Trailer Player"
                className="w-full h-full"
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
