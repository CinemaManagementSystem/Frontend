import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Ticket, Star, Clock, Sparkles, Search, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';
import { MovieCard } from '@/components/ui/Card/MovieCard';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { formatDuration } from '@/utils/formatDate';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useMovieStore();
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState('');

  const featuredMovie = movies.find((m) => m.status === 'FEATURED') || movies[0];

  const categories = [
    { id: 'ALL', name: 'All Movies' },
    { id: 'NOW_SHOWING', name: 'Now Showing' },
    { id: 'COMING_SOON', name: 'Coming Soon' },
    { id: 'FEATURED', name: 'Featured' },
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchesCategory =
      selectedCategory === 'ALL' || movie.status === selectedCategory;
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleWatchTrailer = (url?: string) => {
    if (url) {
      setActiveTrailerUrl(url);
      setTrailerModalOpen(true);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Banner Section */}
      {featuredMovie && (
        <section className="relative w-full min-h-[75vh] lg:min-h-[85vh] flex items-end overflow-hidden bg-black">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredMovie.backdropUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center opacity-60 filter contrast-125"
            />
            {/* Multi-angle cinematic gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f10] via-[#0f0f10]/70 to-transparent w-full md:w-3/4" />
          </div>

          {/* Hero Content */}
          <motion.div   
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full"
          >
            <div className="max-w-2xl space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E50914]/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  PREMIERE OF THE WEEK
                </span>
                <Badge variant="secondary" size="md">
                  PG-13
                </Badge>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-border text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{featuredMovie.rating.toFixed(1)} / 10</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{formatDuration(featuredMovie.durationMinutes)}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase drop-shadow-2xl">
                {featuredMovie.title}
              </h1>

              {/* Genres */}
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
                {featuredMovie.genres.join(' • ')}
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed drop-shadow">
                {featuredMovie.description}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => navigate(`/booking/st-1?movieId=${featuredMovie.id}`)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-sm font-bold tracking-wider uppercase transition-all shadow-xl shadow-[#E50914]/40 hover:scale-105 active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets Now
                </button>

                {featuredMovie.trailerUrl && (
                  <button
                    onClick={() => handleWatchTrailer(featuredMovie.trailerUrl)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-border text-white text-sm font-semibold backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                  >
                    <Play className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Movies Catalog & Discovery Section */}
      <section id="movies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              EXPLORE MOVIES
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select a movie to check showtimes and reserve your seats in seconds
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-border text-white text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#E50914] transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30'
                    : 'bg-[#18181b] text-muted-foreground hover:text-white hover:bg-white/5 border border-border'
                }`}
              >
                {cat.name}
              </motion.button>
            );
          })}
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <motion.div 
            key={selectedCategory + searchQuery}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center bg-white/5 border border-border rounded-2xl p-8 space-y-3">
            <Compass className="w-10 h-10 text-muted-foreground mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find any movie matching "{searchQuery}". Try changing your search query or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Cinema Formats Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#18181c] via-[#141417] to-[#1a1112] border border-border space-y-8 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-[#E50914] tracking-widest uppercase">
              EXPERIENCE THE BEST
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              WORLD-CLASS CINEMATIC TECHNOLOGY
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Immerse yourself in crystal clear giant screens, precision sound systems, and ultra-plush seating.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ y: -4, borderColor: 'rgba(229, 9, 20, 0.4)' }}
              className="p-5 rounded-2xl bg-white/5 border border-border space-y-2 transition-colors duration-200"
            >
              <span className="text-lg font-black text-[#E50914]">IMAX 3D Laser</span>
              <p className="text-xs text-muted-foreground">
                Next-generation 4K laser projection with breathtaking realism and dynamic range.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, borderColor: 'rgba(250, 204, 21, 0.4)' }}
              className="p-5 rounded-2xl bg-white/5 border border-border space-y-2 transition-colors duration-200"
            >
              <span className="text-lg font-black text-amber-400">Dolby Atmos Audio</span>
              <p className="text-xs text-muted-foreground">
                Multi-dimensional sound that moves all around you with unmatched clarity and depth.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.2)' }}
              className="p-5 rounded-2xl bg-white/5 border border-border space-y-2 transition-colors duration-200"
            >
              <span className="text-lg font-black text-white">VIP Suite Recliners</span>
              <p className="text-xs text-muted-foreground">
                Motorized leather recliners with in-seat food and beverage service on demand.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trailer Video Modal */}
      <Modal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        maxWidth="2xl"
        title="Movie Trailer"
      >
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
          {activeTrailerUrl && (
            <iframe
              src={activeTrailerUrl}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
