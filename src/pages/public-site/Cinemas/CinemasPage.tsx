import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown, Calendar, Filter, Sparkles, Star, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';

interface CinemaLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export const CinemasPage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, showtimes, seedShowtimesForDate } = useMovieStore();

  const cinemas: CinemaLocation[] = [
    {
      id: 'c-1',
      name: 'Cinematique Grand Central',
      address: '42nd St & Park Ave, New York, NY',
      phone: '+1 (212) 555-0199'
    },
    {
      id: 'c-2',
      name: 'Cinematique City Center',
      address: '700 5th Ave, Seattle, WA',
      phone: '+1 (206) 555-0144'
    },
    {
      id: 'c-3',
      name: 'Cinematique Sunset Strip',
      address: '8500 Sunset Blvd, West Hollywood, CA',
      phone: '+1 (310) 555-0188'
    }
  ];

  // State
  const [selectedCinema, setSelectedCinema] = useState<CinemaLocation>(cinemas[0]);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'TODAY' | 'THIS_WEEK'>('TODAY');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('ALL');

  // Generate 8 days starting from today
  const [dateList, setDateList] = useState<Array<{
    dateStr: string;
    dayName: string;
    dayNum: string;
    monthName: string;
  }>>([]);

  useEffect(() => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateVal}`;

      list.push({
        dateStr,
        dayName: days[d.getDay()],
        dayNum: String(d.getDate()),
        monthName: months[d.getMonth()]
      });
    }

    setDateList(list);
    // Set default selected date as today
    if (list.length > 0) {
      setSelectedDate(list[0].dateStr);
    }
  }, []);

  // Whenever selectedDate changes, seed the showtimes in the store if they don't exist
  useEffect(() => {
    if (selectedDate) {
      seedShowtimesForDate(selectedDate);
    }
  }, [selectedDate, seedShowtimesForDate]);

  // Handle location selector change
  const handleSelectCinema = (cinema: CinemaLocation) => {
    setSelectedCinema(cinema);
    setLocationDropdownOpen(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedFormat('ALL');
    setSelectedTimeFilter('ALL');
  };

  // Filter showtimes
  const filteredShowtimes = showtimes.filter((st) => {
    // 1. Matches selected cinema
    if (st.cinemaId !== selectedCinema.id) return false;

    // 2. Matches date
    if (st.date !== selectedDate) return false;

    // 3. Matches format filter
    if (selectedFormat !== 'ALL') {
      if (selectedFormat === 'IMAX' && st.format !== 'IMAX') return false;
      if (selectedFormat === 'DOLBY' && st.format !== 'Dolby') return false;
      if (selectedFormat === 'VIP' && st.format !== 'VIP') return false;
      if (selectedFormat === '3D' && st.format !== '3D') return false;
      if (selectedFormat === '2D' && st.format !== '2D') return false;
    }

    // 4. Matches time filter
    if (selectedTimeFilter !== 'ALL') {
      const hour = parseInt(st.time.split(':')[0], 10);
      if (selectedTimeFilter === 'MORNING' && hour >= 12) return false;
      if (selectedTimeFilter === 'AFTERNOON' && (hour < 12 || hour >= 17)) return false;
      if (selectedTimeFilter === 'EVENING' && hour < 17) return false;
    }

    return true;
  });

  // Group showtimes by Movie
  const showtimesByMovie: Record<string, typeof filteredShowtimes> = {};
  filteredShowtimes.forEach((st) => {
    if (!showtimesByMovie[st.movieId]) {
      showtimesByMovie[st.movieId] = [];
    }
    showtimesByMovie[st.movieId].push(st);
  });

  const activeFormatFilters = [
    { id: 'ALL', label: 'All Formats' },
    { id: 'IMAX', label: 'IMAX 3D Laser' },
    { id: 'DOLBY', label: 'Dolby Atmos' },
    { id: 'VIP', label: 'VIP Director Suite' },
    { id: '3D', label: 'Standard 3D' },
    { id: '2D', label: 'Standard Digital' }
  ];

  const activeTimeFilters = [
    { id: 'ALL', label: 'All Showtimes' },
    { id: 'MORNING', label: 'Morning (Before 12 PM)' },
    { id: 'AFTERNOON', label: 'Afternoon (12 PM - 5 PM)' },
    { id: 'EVENING', label: 'Evening (After 5 PM)' }
  ];

  return (
    <div className="pb-24 bg-[#0f0f10] min-h-screen text-white selection:bg-[#E50914]">
      {/* Dynamic Design Header - Glassmorphic Hero */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden border-b border-white/5 bg-gradient-to-b from-zinc-900 to-[#0f0f10]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"
            alt="Cinema Interior"
            className="w-full h-full object-cover object-center opacity-10 filter grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                SHOWTIMES & TICKETS
              </span>
            </div>
            
            {/* Cinema Location Title Selector */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-3 text-3xl sm:text-5xl font-black text-white uppercase tracking-tight text-left focus:outline-none hover:text-gray-300 transition-colors cursor-pointer group"
              >
                <span>{selectedCinema.name}</span>
                <ChevronDown className="w-8 h-8 text-[#E50914] group-hover:translate-y-0.5 transition-transform" />
              </button>

              <AnimatePresence>
                {locationDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20 cursor-default" 
                      onClick={() => setLocationDropdownOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-3 w-80 rounded-2xl bg-zinc-950 border border-white/10 p-2 shadow-2xl z-30 origin-top-left"
                    >
                      <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-gray-500 border-b border-white/5 mb-1">
                        Choose Cinema Location
                      </div>
                      {cinemas.map((cinema) => (
                        <button
                          key={cinema.id}
                          onClick={() => handleSelectCinema(cinema)}
                          className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 hover:bg-white/5 ${
                            selectedCinema.id === cinema.id 
                              ? 'bg-[#E50914]/10 text-white border border-[#E50914]/20' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="text-sm font-bold">{cinema.name}</span>
                          <span className="text-[10px] text-gray-500">{cinema.address}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-[#E50914]" />
              <span className="font-semibold text-gray-300">{selectedCinema.address}</span>
              <span className="text-gray-600">•</span>
              <span>{selectedCinema.phone}</span>
            </div>
          </div>

          {/* Today / This Week Filter Tabs */}
          <div className="flex bg-[#18181b] border border-white/5 p-1 rounded-xl shadow-inner max-w-xs shrink-0 self-start md:self-end relative overflow-hidden">
            <button
              onClick={() => setTimeframe('TODAY')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative z-10 ${
                timeframe === 'TODAY'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeframe === 'TODAY' && (
                <motion.div
                  layoutId="activeTimeframe"
                  className="absolute inset-0 bg-[#E50914] rounded-lg shadow-md shadow-[#E50914]/30 z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">Today</span>
            </button>
            <button
              onClick={() => setTimeframe('THIS_WEEK')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all relative z-10 ${
                timeframe === 'THIS_WEEK'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {timeframe === 'THIS_WEEK' && (
                <motion.div
                  layoutId="activeTimeframe"
                  className="absolute inset-0 bg-[#E50914] rounded-lg shadow-md shadow-[#E50914]/30 z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">This Week</span>
            </button>
          </div>
        </div>
      </section>

      {/* Date Picker Bar */}
      <section className="bg-zinc-950 border-b border-white/5 py-4 sticky top-18 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-2 shrink-0 border-r border-white/10 pr-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-[#E50914]" />
              <span>Select Date</span>
            </div>
            
            <div className="flex items-center gap-2">
              {dateList.map((d, index) => {
                const active = selectedDate === d.dateStr;
                return (
                  <motion.button
                    key={d.dateStr}
                    onClick={() => setSelectedDate(d.dateStr)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border min-w-[70px] transition-all relative ${
                      active
                        ? 'bg-[#E50914] text-white border-transparent shadow-lg shadow-[#E50914]/40 scale-105'
                        : 'bg-[#18181b] border-white/5 hover:border-white/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      {index === 0 ? 'Today' : d.dayName}
                    </span>
                    <span className="text-base font-black my-0.5">
                      {d.dayNum}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-widest opacity-75">
                      {d.monthName}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Filter Panels */}
        <div className="lg:col-span-1 bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E50914]" />
              Filter Showtimes
            </h3>
            {(selectedFormat !== 'ALL' || selectedTimeFilter !== 'ALL') && (
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-[#E50914] hover:underline uppercase"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Formats filter */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
              Format
            </span>
            <div className="flex flex-col gap-2">
              {activeFormatFilters.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedFormat === fmt.id
                      ? 'bg-[#E50914] text-white border-transparent shadow-md'
                      : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timefilter */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">
              Showtime Time
            </span>
            <div className="flex flex-col gap-2">
              {activeTimeFilters.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTimeFilter(t.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTimeFilter === t.id
                      ? 'bg-[#E50914] text-white border-transparent shadow-md'
                      : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Movie list showing showtimes */}
        <motion.div 
          key={selectedCinema.id + selectedDate + selectedFormat + selectedTimeFilter}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-3 space-y-6"
        >
          {Object.keys(showtimesByMovie).length > 0 ? (
            Object.entries(showtimesByMovie).map(([movieId, movieShowtimes]) => {
              const movie = movies.find((m) => m.id === movieId);
              if (!movie) return null;

              // Group showtimes of this movie by Hall/Format combo
              const formatGroups: Record<string, { formatName: string; list: typeof movieShowtimes }> = {};
              movieShowtimes.forEach((st) => {
                const groupKey = `${st.format}-${st.hallName}`;
                if (!formatGroups[groupKey]) {
                  formatGroups[groupKey] = {
                    formatName: `${st.format} (${st.hallName})`,
                    list: []
                  };
                }
                formatGroups[groupKey].list.push(st);
              });

              return (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  className="bg-[#141417] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 hover:border-white/15 transition-all duration-300"
                >
                  {/* Movie Poster & Basic Details */}
                  <div className="w-full md:w-44 shrink-0 space-y-4">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-56 md:h-64 object-cover rounded-2xl border border-white/10 shadow-lg shadow-black/40 hover:scale-102 transition-transform duration-300"
                    />
                    <div className="space-y-2 hidden md:block">
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{movie.rating.toFixed(1)} / 10</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{movie.durationMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Movie Showtimes Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h4 
                        onClick={() => navigate(`/movies/${movie.id}`)}
                        className="text-xl font-black text-white hover:text-[#E50914] cursor-pointer transition-colors uppercase tracking-tight"
                      >
                        {movie.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider text-[#E50914]">
                        {movie.genres.join(' • ')}
                      </p>
                      <p className="text-xs text-gray-300 mt-3 line-clamp-2 md:line-clamp-3 leading-relaxed">
                        {movie.description}
                      </p>
                    </div>

                    {/* Showtimes by Format Groups */}
                    <div className="space-y-5 pt-3 border-t border-white/5">
                      {Object.values(formatGroups).map((group) => (
                        <div key={group.formatName} className="space-y-2.5">
                          <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block">
                            {group.formatName}
                          </span>
                          
                          <div className="flex flex-wrap gap-3">
                            {group.list.sort((a,b) => a.time.localeCompare(b.time)).map((st) => {
                              // Capacity calculations
                              const occupiedCount = st.occupiedSeats.length;
                              const totalSeats = 80;
                              const occupancyPercent = (occupiedCount / totalSeats) * 100;
                              
                              let statusColor = 'bg-emerald-500';
                              let hoverBorderColor = 'hover:border-emerald-500';
                              let occupancyLabel = 'Available';
                              const isSoldOut = occupiedCount >= totalSeats;

                              if (isSoldOut) {
                                statusColor = 'bg-rose-500';
                                occupancyLabel = 'SOLD OUT';
                              } else if (occupancyPercent >= 75) {
                                statusColor = 'bg-amber-500';
                                hoverBorderColor = 'hover:border-amber-500';
                                occupancyLabel = 'ALMOST FULL';
                              }

                              return (
                                <motion.button
                                  key={st.id}
                                  disabled={isSoldOut}
                                  onClick={() => navigate(`/booking/${st.id}?movieId=${movie.id}`)}
                                  whileHover={isSoldOut ? {} : { scale: 1.05 }}
                                  whileTap={isSoldOut ? {} : { scale: 0.95 }}
                                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-900 border border-white/5 min-w-[95px] transition-all group ${
                                    isSoldOut 
                                      ? 'opacity-40 cursor-not-allowed border-transparent' 
                                      : `hover:bg-white/5 cursor-pointer ${hoverBorderColor}`
                                  }`}
                                  title={`${occupancyLabel} (${occupiedCount}/${totalSeats} seats)`}
                                >
                                  {isSoldOut ? (
                                    <>
                                      <span className="text-sm font-black text-gray-500 line-through">
                                        {st.time}
                                      </span>
                                      <span className="text-[8px] font-bold text-rose-500 mt-1 tracking-wider">
                                        SOLD OUT
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm font-black text-white group-hover:text-[#E50914] transition-colors">
                                        {st.time}
                                      </span>
                                      {/* Occupancy Indicator Bar */}
                                      <div className="w-12 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                        <div 
                                          className={`h-full ${statusColor}`}
                                          style={{ width: `${Math.max(15, occupancyPercent)}%` }}
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
            })
          ) : (
            /* Empty State */
            <div className="py-20 text-center bg-[#141417] border border-white/10 rounded-3xl p-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto animate-pulse" />
              <h3 className="text-lg font-black text-white uppercase tracking-wider">No Showtimes Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                There are no scheduled showtimes at {selectedCinema.name} matching your format or time filters on the selected date.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};
