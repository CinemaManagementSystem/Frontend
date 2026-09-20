import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee, MapPin, Search, Ticket, Sparkles } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { HeroCarousel } from '@/components/common/HeroCarousel/HeroCarousel';
import { SectionTabs } from '@/components/common/SectionTabs/SectionTabs';
import { DateSelector } from '@/components/common/DateSelector/DateSelector';
import { MovieGrid } from '@/components/common/MovieGrid/MovieGrid';
import { MovieCardSkeleton } from '@/components/common/Skeleton/Skeleton';
import { getCinemaDate, isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { useHeroBackdrop } from '@/context/HeroBackdropContext';
import septemberBanner from '@/assets/banner/image.png';
import grabBanner from '@/assets/banner/image copy.png';
import goldClassBanner from '@/assets/banner/image copy 2.png';
import popcornBanner from '@/assets/banner/image copy 3.png';

type ListingTab = 'NOW_SHOWING' | 'COMING_SOON';

const HOME_BANNER_SLIDES = [
  { id: 'home-september-special', image: septemberBanner, fallbackImage: septemberBanner, title: 'September Special' },
  { id: 'home-grab-delivery', image: grabBanner, fallbackImage: grabBanner, title: 'Grab Delivery Promotion' },
  { id: 'home-gold-class', image: goldClassBanner, fallbackImage: goldClassBanner, title: 'Gold Class Ticket Package' },
  { id: 'home-big-bucket', image: popcornBanner, fallbackImage: popcornBanner, title: 'Big Bucket Free Drink' },
];

const dateFormatter = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

const getDateString = (date: Date) => date.toISOString().slice(0, 10);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentImage } = useHeroBackdrop();
  const { movies, showtimes, searchQuery, setSearchQuery, fetchCatalog, loading, error } = useMovieStore();
  const { cinemas, selectedCinemaId } = useCinemaStore();
  const [activeListingTab, setActiveListingTab] = useState<ListingTab>('NOW_SHOWING');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

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
      dateStr: date,
      dayName: date === today ? 'Today' : dateFormatter(date, { weekday: 'short' }),
      dayNum: dateFormatter(date, { day: 'numeric' }),
      monthName: dateFormatter(date, { month: 'short' }),
      isToday: date === today,
      hasShowtimes: availableDates.includes(date),
    }));
  }, [availableDates, today]);

  useEffect(() => {
    const firstBookableDate = availableDates.find((date) => date >= today) ?? today;
    setSelectedDate((current) => dateCards.some((date) => date.dateStr === current) ? current : firstBookableDate);
  }, [availableDates, dateCards, today]);

  const selectedDateShowtimes = useMemo(() => upcomingShowtimes.filter((showtime) => showtime.date === selectedDate), [selectedDate, upcomingShowtimes]);
  const selectedMovieIds = useMemo(() => new Set(selectedDateShowtimes.map((showtime) => showtime.movieId)), [selectedDateShowtimes]);

  const comingSoonMonths = useMemo(() => [...new Set(movies
    .filter((movie) => movie.status === 'COMING_SOON')
    .map((movie) => movie.releaseDate.slice(0, 7)))].sort(), [movies]);

  const monthCards = useMemo(() => comingSoonMonths.map((month) => ({
    id: month,
    label: dateFormatter(`${month}-01`, { month: 'long' }),
  })), [comingSoonMonths]);

  useEffect(() => {
    setSelectedMonth((current) => comingSoonMonths.includes(current) ? current : (comingSoonMonths[0] ?? ''));
  }, [comingSoonMonths]);

  const filteredMovies = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const hasDateListings = activeListingTab === 'NOW_SHOWING' && selectedDate !== '';
    return movies.filter((movie) => {
      const matchesListing = movie.status === activeListingTab || (activeListingTab === 'NOW_SHOWING' && movie.status === 'FEATURED');
      const matchesDate = !hasDateListings || selectedMovieIds.has(movie.id);
      const matchesMonth = activeListingTab !== 'COMING_SOON' || !selectedMonth || movie.releaseDate.startsWith(selectedMonth);
      const matchesSearch = !normalizedSearch || movie.title.toLowerCase().includes(normalizedSearch) || movie.genres.some((genre) => genre.toLowerCase().includes(normalizedSearch));
      return matchesListing && matchesDate && matchesMonth && matchesSearch;
    });
  }, [activeListingTab, movies, searchQuery, selectedDate, selectedMonth, selectedMovieIds]);

  const nowShowingCount = useMemo(() => movies.filter((m) => m.status === 'NOW_SHOWING' || m.status === 'FEATURED').length, [movies]);
  const comingSoonCount = useMemo(() => movies.filter((m) => m.status === 'COMING_SOON').length, [movies]);

  return (
    <div className="home-page min-h-screen overflow-hidden bg-[#050505] pb-20 text-white [background-image:radial-gradient(ellipse_70%_40%_at_50%_72%,rgba(120,10,20,0.18),transparent_70%)]">
      <HeroCarousel
        slides={HOME_BANNER_SLIDES}
        autoPlayInterval={5000}
        onActiveImageChange={setCurrentImage}
      />

      {error && movies.length === 0 && (
        <section className="container-main py-24 text-center" role="alert">
          <Ticket className="mx-auto h-10 w-10 text-[var(--primary)]" />
          <h1 className="mt-5 text-3xl font-black">Unable to load movies.</h1>
          <p className="mt-3 text-sm text-white/60">The catalogue could not be loaded right now.</p>
          <button
            type="button"
            onClick={() => void fetchCatalog()}
            className="mt-6 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Try Again
          </button>
        </section>
      )}

      <section id="home-movies" className="container-main scroll-mt-24 pt-10">
        <div className="flex flex-col gap-5">
          <div>
            <SectionTabs
              tabs={[
                { id: 'NOW_SHOWING', label: 'Now Showing', count: nowShowingCount },
                { id: 'COMING_SOON', label: 'Coming Soon', count: comingSoonCount },
              ]}
              activeTab={activeListingTab}
              onTabChange={(tab) => setActiveListingTab(tab as ListingTab)}
              variant="home"
            />
            <p className="hidden mt-2 flex items-center gap-1.5 text-xs text-white/45">
              <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
              {selectedCinema ? selectedCinema.name : 'All cinemas'} · Cambodia local time
            </p>
          </div>

          <label className="relative hidden w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <span className="sr-only">Search movies</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search movies..."
              className="search-pill"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className="mt-10" role="tabpanel" id={`panel-${activeListingTab}`} aria-labelledby={`tab-${activeListingTab}`}>
              {activeListingTab === 'NOW_SHOWING' ? (
                <DateSelector
                  dateList={dateCards}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  className="border-0 bg-transparent px-0 pt-0"
                  showLabel={false}
                  variant="home"
                />
              ) : (
                <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto" aria-label="Coming soon months">
                  {monthCards.map((month) => (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => setSelectedMonth(month.id)}
                      aria-pressed={selectedMonth === month.id}
                      className={`h-20 min-w-[140px] snap-start rounded-xl border bg-black/60 px-4 py-2.5 text-base font-black transition-colors duration-200 hover:border-white/50 ${selectedMonth === month.id ? 'border-red-600 bg-red-950/30 text-white shadow-[0_0_20px_rgba(225,29,46,0.25)]' : 'border-white/20 text-white/75'}`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <MovieGrid
              key={`${activeListingTab}-${selectedDate}-${searchQuery}`}
              movies={filteredMovies}
              onMovieClick={(movie) => navigate(`/movies/${movie.id}`)}
              emptyMessage="No films match that selection"
              className="mt-12"
              variant="home"
            />
          </>
        )}

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Plan your visit</p>
            <h2 className="mt-2 text-xl font-black">Find the right screen for your night.</h2>
          </div>
          <button type="button" onClick={() => navigate('/cinemas')} className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-5 py-3 text-xs font-bold text-white/75 transition hover:border-[var(--primary)] hover:text-white">
            Explore cinemas <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <section className="grid gap-4 pb-12 pt-2 md:grid-cols-[1.3fr_0.7fr]" aria-label="Cinema experiences">
          <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(225,29,46,.24),rgba(15,15,18,.92)_55%)] p-6 sm:p-8">
            <div className="relative z-10 max-w-md">
              <p className="eyebrow">Make it a night out</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">Seats, snacks, and a story worth staying for.</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">Choose your cinema, find the right showtime, and add your favourite bites before you arrive.</p>
              <button type="button" onClick={() => navigate('/fnb')} className="btn-pill-outline mt-6">
                Explore food & drinks <Coffee className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/5 transition-transform duration-500 group-hover:scale-110" />
          </article>

          <article className="surface-panel rounded-2xl p-6 sm:p-8">
            <Sparkles className="h-6 w-6 text-[var(--primary)]" />
            <p className="eyebrow mt-5">Premiere circle</p>
            <h2 className="mt-3 text-xl font-black text-foreground">Get closer to the films you love.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Early access, member events, and rewards for every visit.</p>
            <button type="button" onClick={() => navigate('/membership')} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:gap-3">
              Discover membership <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        </section>
      </section>

    </div>
  );
};
