import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Play,
  Search,
  Star,
  Ticket,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { Modal } from '@/components/ui/Modal/Modal';
import { getCinemaDate, isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { formatDuration } from '@/utils/formatDate';
import type { Movie } from '@/types/movie';

type ListingTab = 'NOW_SHOWING' | 'COMING_SOON';

const dateFormatter = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

const getMovieStatusLabel = (status: Movie['status']) => {
  if (status === 'COMING_SOON') return 'Coming Soon';
  if (status === 'FEATURED') return 'Featured';
  return 'Now Showing';
};

const getDateString = (date: Date) => date.toISOString().slice(0, 10);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { movies, showtimes, searchQuery, setSearchQuery, fetchCatalog, catalogRequiresSignIn } = useMovieStore();
  const { cinemas, selectedCinemaId } = useCinemaStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [activeListingTab, setActiveListingTab] = useState<ListingTab>('NOW_SHOWING');
  const [selectedDate, setSelectedDate] = useState('');
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState('');

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const today = getCinemaDate();
  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);

  const upcomingShowtimes = useMemo(() => showtimes
    .filter((showtime) => isUpcomingShowtime(showtime))
    .filter((showtime) => selectedCinemaId === 'ALL' || showtime.cinemaId === selectedCinemaId)
    .sort((first, second) => parseShowtimeStart(first.startTime) - parseShowtimeStart(second.startTime)),
  [showtimes, selectedCinemaId]);

  const availableDates = useMemo(() => [...new Set(upcomingShowtimes.map((showtime) => showtime.date))], [upcomingShowtimes]);

  const dateCards = useMemo(() => {
    const firstDate = new Date(`${today}T12:00:00Z`);
    const dates = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(firstDate);
      date.setUTCDate(firstDate.getUTCDate() + index);
      return getDateString(date);
    });
    return [...new Set([...dates, ...availableDates])].sort().map((date) => ({
      id: date,
      label: date === today ? 'Today' : dateFormatter(date, { weekday: 'short' }),
      day: dateFormatter(date, { day: '2-digit' }),
      month: dateFormatter(date, { month: 'short' }),
      hasShowtimes: availableDates.includes(date),
    }));
  }, [availableDates, today]);

  useEffect(() => {
    const firstBookableDate = availableDates.find((date) => date >= today) ?? today;
    setSelectedDate((current) => dateCards.some((date) => date.id === current) ? current : firstBookableDate);
  }, [availableDates, dateCards, today]);

  const featuredMovies = useMemo(() => {
    const priority = ['FEATURED', 'NOW_SHOWING', 'COMING_SOON'] as const;
    return priority
      .flatMap((status) => movies.filter((movie) => movie.status === status))
      .filter((movie, index, allMovies) => allMovies.findIndex((item) => item.id === movie.id) === index)
      .slice(0, 6);
  }, [movies]);

  const featuredMovie = featuredMovies[activeSlide] ?? featuredMovies[0];

  useEffect(() => {
    setActiveSlide((current) => Math.min(current, Math.max(featuredMovies.length - 1, 0)));
  }, [featuredMovies.length]);

  useEffect(() => {
    if (isHeroPaused || shouldReduceMotion || featuredMovies.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredMovies.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [featuredMovies.length, isHeroPaused, shouldReduceMotion]);

  const selectedDateShowtimes = useMemo(() => upcomingShowtimes.filter((showtime) => showtime.date === selectedDate), [selectedDate, upcomingShowtimes]);
  const selectedMovieIds = useMemo(() => new Set(selectedDateShowtimes.map((showtime) => showtime.movieId)), [selectedDateShowtimes]);

  const filteredMovies = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const hasDateListings = activeListingTab === 'NOW_SHOWING' && selectedMovieIds.size > 0;
    return movies.filter((movie) => {
      const matchesListing = movie.status === activeListingTab || (activeListingTab === 'NOW_SHOWING' && movie.status === 'FEATURED');
      const matchesDate = !hasDateListings || selectedMovieIds.has(movie.id);
      const matchesSearch = !normalizedSearch || movie.title.toLowerCase().includes(normalizedSearch) || movie.genres.some((genre) => genre.toLowerCase().includes(normalizedSearch));
      return matchesListing && matchesDate && matchesSearch;
    });
  }, [activeListingTab, movies, searchQuery, selectedMovieIds]);

  const getBookingPath = (movieId: string) => {
    if (catalogRequiresSignIn) return `/movies/${movieId}`;
    const matchingShowtime = upcomingShowtimes
      .filter((showtime) => showtime.movieId === movieId)
      .sort((first, second) => {
        const dateBias = Number(second.date === selectedDate) - Number(first.date === selectedDate);
        return dateBias || parseShowtimeStart(first.startTime) - parseShowtimeStart(second.startTime);
      })[0];
    return matchingShowtime ? `/booking/${matchingShowtime.id}?movieId=${movieId}` : `/movies/${movieId}`;
  };

  const handleWatchTrailer = (url?: string) => {
    if (!url) return;
    setActiveTrailerUrl(url);
    setTrailerModalOpen(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050607] pb-20 text-white">
      {featuredMovie ? (
        <section
          className="relative isolate overflow-hidden border-b border-white/10"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          aria-label="Featured movies"
        >
          <div className="absolute inset-0 -z-30 bg-[#101b28]" />
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={featuredMovie.id}
              src={featuredMovie.backdropUrl}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(42,61,84,0.5),transparent_50%),linear-gradient(180deg,rgba(9,13,20,0.22),#050607_96%)]" />

          <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={featuredMovie.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
                  className="relative min-h-[390px] overflow-hidden rounded-[25px] border border-white/20 bg-[#0d141d]/90 shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:min-h-[485px]"
                  aria-live="polite"
                >
                  <img src={featuredMovie.backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,12,0.96)_0%,rgba(5,8,12,0.72)_40%,rgba(5,8,12,0.14)_100%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,6,7,0.78),transparent_38%)]" />

                  <div className="relative grid min-h-[390px] items-end gap-6 p-6 sm:min-h-[485px] sm:p-10 lg:grid-cols-[1fr_280px] lg:items-center lg:p-12">
                    <div className="max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                        <span className="rounded-md bg-[#E50914] px-3 py-1.5 uppercase tracking-wide">{getMovieStatusLabel(featuredMovie.status)}</span>
                        <span className="rounded-md border border-white/20 bg-black/35 px-3 py-1.5 text-white/80">PG-13</span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-black/35 px-3 py-1.5 text-amber-300"><Star className="h-3.5 w-3.5 fill-current" />{featuredMovie.rating.toFixed(1)}</span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/35 px-3 py-1.5 text-white/75"><Clock className="h-3.5 w-3.5" />{formatDuration(featuredMovie.durationMinutes)}</span>
                      </div>

                      <p className="mt-8 text-[11px] font-black uppercase tracking-[0.36em] text-[#ff3943]">Featured at Cinematique</p>
                      <h1 className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-[-0.045em] text-white sm:text-6xl">{featuredMovie.title}</h1>
                      <p className="mt-6 max-w-lg text-sm font-medium leading-7 text-slate-100/90 sm:text-base">{featuredMovie.description}</p>

                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => navigate(getBookingPath(featuredMovie.id))} className="inline-flex items-center gap-2 rounded-full bg-[#E50914] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_10px_28px_rgba(229,9,20,0.35)] transition hover:-translate-y-0.5 hover:bg-[#ff2530] focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                          <Ticket className="h-4 w-4" /> Book Now
                        </button>
                        <button type="button" onClick={() => navigate(`/movies/${featuredMovie.id}`)} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                          View details <ArrowRight className="h-4 w-4" />
                        </button>
                        {featuredMovie.trailerUrl && <button type="button" onClick={() => handleWatchTrailer(featuredMovie.trailerUrl)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur transition hover:bg-white/15" aria-label={`Watch ${featuredMovie.title} trailer`}><Play className="h-4 w-4 fill-white" /></button>}
                      </div>
                    </div>

                    <motion.div className="hidden justify-end lg:flex" initial={{ rotate: 2, y: 10 }} animate={{ rotate: 0, y: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}>
                      <img src={featuredMovie.posterUrl} alt={`${featuredMovie.title} poster`} className="h-[350px] w-[238px] rounded-[20px] border border-white/25 object-cover shadow-2xl shadow-black/60" />
                    </motion.div>
                  </div>
                </motion.article>
              </AnimatePresence>

              <div className="mt-5 flex items-center justify-center gap-2" aria-label="Featured movie slides">
                <button type="button" onClick={() => setActiveSlide((current) => (current - 1 + featuredMovies.length) % featuredMovies.length)} className="mr-3 hidden h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/60 hover:bg-white/10 sm:flex" aria-label="Previous featured movie"><ChevronLeft className="h-4 w-4" /></button>
                {featuredMovies.map((movie, index) => <button key={movie.id} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show ${movie.title}`} aria-current={index === activeSlide ? 'true' : undefined} className="rounded-full p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><span className={`block h-2 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-[#E50914]' : 'w-2 bg-white/35 hover:bg-white/75'}`} /></button>)}
                <button type="button" onClick={() => setActiveSlide((current) => (current + 1) % featuredMovies.length)} className="ml-3 hidden h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/60 hover:bg-white/10 sm:flex" aria-label="Next featured movie"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-5xl px-4 py-24 text-center"><Ticket className="mx-auto h-10 w-10 text-[#E50914]" /><h1 className="mt-5 text-3xl font-black">Your next movie starts here.</h1><p className="mt-3 text-sm text-white/60">We are refreshing the cinema catalogue.</p></section>
      )}

      <section id="home-movies" className="mx-auto max-w-5xl scroll-mt-24 px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setActiveListingTab('NOW_SHOWING')} className={`text-2xl font-black tracking-tight transition sm:text-3xl ${activeListingTab === 'NOW_SHOWING' ? 'text-white' : 'text-white/35 hover:text-white/65'}`}>Now Showing</button>
              <span className="text-2xl font-light text-white/20">|</span>
              <button type="button" onClick={() => setActiveListingTab('COMING_SOON')} className={`text-2xl font-black tracking-tight transition sm:text-3xl ${activeListingTab === 'COMING_SOON' ? 'text-white' : 'text-white/35 hover:text-white/65'}`}>Coming Soon</button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/45"><MapPin className="h-3.5 w-3.5 text-[#E50914]" />{selectedCinema ? selectedCinema.name : 'All cinemas'} · Cambodia local time</p>
          </div>
          <label className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" /><span className="sr-only">Search movies</span><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search movies..." className="h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-4 text-xs font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914]" /></label>
        </div>

        <div className="mt-7 flex items-center gap-2.5 overflow-x-auto pb-1" aria-label="Movie dates">
          <div className="mr-1 hidden shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/40 sm:flex"><CalendarDays className="h-4 w-4 text-[#E50914]" />Dates</div>
          {dateCards.map((date) => {
            const active = date.id === selectedDate;
            return <button key={date.id} type="button" onClick={() => setSelectedDate(date.id)} aria-pressed={active} aria-label={`${date.label}, ${date.month} ${date.day}${date.hasShowtimes ? ', screenings available' : ''}`} className={`relative flex min-w-[92px] shrink-0 flex-col items-center rounded-xl border px-4 py-2.5 transition ${active ? 'border-[#E50914] bg-[#090a0d] text-white shadow-[0_0_0_1px_rgba(229,9,20,0.5)]' : 'border-white/10 bg-white/[0.035] text-white/50 hover:border-white/25 hover:text-white'}`}><span className="text-[10px] font-bold uppercase tracking-wider">{date.label}</span><span className="mt-1 text-xl font-black leading-none">{date.day}</span><span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">{date.month}</span>{date.hasShowtimes && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${active ? 'bg-[#E50914]' : 'bg-[#E50914]/70'}`} />}</button>;
          })}
        </div>

        {filteredMovies.length > 0 ? <motion.div key={`${activeListingTab}-${selectedDate}-${searchQuery}`} initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
          {filteredMovies.map((movie) => <article key={movie.id} className="group min-w-0">
            <button type="button" onClick={() => navigate(`/movies/${movie.id}`)} className="relative block w-full overflow-hidden rounded-xl border border-white/10 bg-[#13171e] text-left shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-[#E50914]/70 hover:shadow-[0_14px_30px_rgba(229,9,20,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]">
              <img src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.035]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
              <span className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white/85 backdrop-blur">{getMovieStatusLabel(movie.status)}</span>
              <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold text-amber-300 backdrop-blur"><Star className="h-3 w-3 fill-current" />{movie.rating.toFixed(1)}</span>
              <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2"><span className="line-clamp-2 text-sm font-black uppercase leading-tight text-white">{movie.title}</span><span className="shrink-0 rounded-full bg-[#E50914] p-2 text-white opacity-0 transition group-hover:opacity-100"><ArrowRight className="h-3.5 w-3.5" /></span></span>
            </button>
            <div className="mt-3 flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold text-white/80">{movie.genres.slice(0, 2).join(' · ') || 'Feature film'}</p><span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-white/45"><Clock className="h-3 w-3" />{formatDuration(movie.durationMinutes)}</span></div>
            <button type="button" onClick={() => navigate(getBookingPath(movie.id))} className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#ff4a52] transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]">Book tickets <Ticket className="h-3 w-3" /></button>
          </article>)}
        </motion.div> : <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-12 text-center"><Search className="mx-auto h-8 w-8 text-white/35" /><h2 className="mt-4 text-lg font-bold">No films match that selection</h2><p className="mt-2 text-sm text-white/45">Try another date, tab, or search term.</p><button type="button" onClick={() => setSearchQuery('')} className="mt-5 rounded-full bg-[#E50914] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white">Clear search</button></div>}

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff3943]">Plan your visit</p><h2 className="mt-2 text-xl font-black">Find the right screen for your night.</h2></div><button type="button" onClick={() => navigate('/cinemas')} className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-5 py-3 text-xs font-bold text-white/75 transition hover:border-[#E50914] hover:text-white">Explore cinemas <ArrowRight className="h-4 w-4" /></button></div>
      </section>

      <Modal isOpen={trailerModalOpen} onClose={() => setTrailerModalOpen(false)} maxWidth="2xl" title="Movie Trailer"><div className="aspect-video w-full overflow-hidden rounded-xl bg-black">{activeTrailerUrl && <iframe src={activeTrailerUrl} title="Movie trailer" className="h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}</div></Modal>
    </div>
  );
};
