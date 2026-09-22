import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee, MapPin, Search, Sparkles, Ticket } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useSettingsStore } from '@/store/settingsStore';
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
import { useTranslation } from '@/i18n';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentImage } = useHeroBackdrop();
  const { movies, showtimes, searchQuery, setSearchQuery, fetchCatalog, loading, error } = useMovieStore();
  const { cinemas, selectedCinemaId } = useCinemaStore();
  const language = useSettingsStore((state) => state.language);
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
      dayName: date === today ? t.home.today : dateFormatter(date, { weekday: 'short' }),
      dayNum: dateFormatter(date, { day: 'numeric' }),
      monthName: dateFormatter(date, { month: 'short' }),
      isToday: date === today,
      hasShowtimes: availableDates.includes(date),
    }));
  }, [availableDates, today, t.home.today]);

  useEffect(() => {
    const firstBookableDate = availableDates.find((date) => date >= today) ?? today;
    setSelectedDate((current) => dateCards.some((date) => date.dateStr === current) ? current : firstBookableDate);
  }, [availableDates, dateCards, today]);

  const selectedDateShowtimes = useMemo(() => upcomingShowtimes.filter((showtime) => showtime.date === selectedDate), [selectedDate, upcomingShowtimes]);
  const selectedMovieIds = useMemo(() => new Set(selectedDateShowtimes.map((showtime) => showtime.movieId)), [selectedDateShowtimes]);

  const comingSoonMonths = useMemo(() => [...new Set(movies
    .filter((movie) => movie.status === 'COMING_SOON')
    .map((movie) => movie.releaseDate.slice(0, 7)))].sort().slice(0, 6), [movies]);

  const monthCards = useMemo(() => comingSoonMonths.map((month) => ({
    id: month,
    label: new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${month}-01T12:00:00Z`)),
  })), [comingSoonMonths, language]);

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
    <div className="home-page min-h-screen overflow-hidden bg-background pb-20 text-foreground">
      <HeroCarousel
        slides={HOME_BANNER_SLIDES}
        autoPlayInterval={5000}
        onActiveImageChange={setCurrentImage}
      />

      {error && movies.length === 0 && (
        <section className="container-main py-24 text-center" role="alert">
          <Ticket className="mx-auto h-10 w-10 text-[var(--primary)]" />
          <h1 className="mt-5 text-3xl font-black text-foreground">{t.home.unableToLoad}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t.home.catalogueError}</p>
          <button
            type="button"
            onClick={() => void fetchCatalog()}
            className="mt-6 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {t.home.tryAgain}
          </button>
        </section>
      )}

      <section id="home-movies" className="container-main scroll-mt-24 pt-10">
        <div className="flex flex-col gap-5">
          <div>
            <SectionTabs
              tabs={[
                { id: 'NOW_SHOWING', label: t.home.nowShowing, count: nowShowingCount },
                { id: 'COMING_SOON', label: t.home.comingSoon, count: comingSoonCount },
              ]}
              activeTab={activeListingTab}
              onTabChange={(tab) => setActiveListingTab(tab as ListingTab)}
              variant="home"
            />
            <p className="hidden mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
              {selectedCinema ? selectedCinema.name : t.nav.allCinemas} · Cambodia local time
            </p>
          </div>

          <label className="relative hidden w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">{t.nav.searchMovies}</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.nav.searchPlaceholder}
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
                <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto md:gap-6" aria-label="Coming soon months">
                  {monthCards.map((month) => (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => setSelectedMonth(month.id)}
                      aria-pressed={selectedMonth === month.id}
                      className={`h-20 min-w-[140px] snap-start rounded-xl border px-4 py-2.5 text-base font-black transition-colors duration-200 hover:border-foreground/40 ${selectedMonth === month.id ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-foreground shadow-[0_0_20px_rgba(225,29,46,0.25)]' : 'border-border bg-card/60 text-muted-foreground'}`}
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
              emptyMessage={activeListingTab === 'COMING_SOON' ? t.home.noUpcoming : t.home.noFilmsMatch}
              className="mt-12"
              variant="home"
            />
          </>
        )}

        <div className="mt-14 flex flex-col gap-4 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">{t.home.planYourVisit}</p>
            <h2 className="mt-2 text-xl font-black text-foreground">{t.home.findRightScreen}</h2>
          </div>
          <button type="button" onClick={() => navigate('/cinemas')} className="inline-flex items-center gap-2 self-start rounded-full border border-border px-5 py-3 text-xs font-bold text-muted-foreground transition hover:border-[var(--primary)] hover:text-foreground">
            {t.home.exploreCinemas} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <section className="grid gap-4 pb-12 pt-2 md:grid-cols-[1.3fr_0.7fr]" aria-label="Cinema experiences">
          <article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="relative z-10 max-w-md">
              <p className="eyebrow">{t.home.makeItNightOut}</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{t.home.seatsSnacksStory}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.home.seatsSnacksDesc}</p>
              <button type="button" onClick={() => navigate('/fnb')} className="btn-pill-outline mt-6">
                {t.home.exploreFnb} <Coffee className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-primary/5 transition-transform duration-500 group-hover:scale-110" />
          </article>

          <article className="surface-panel rounded-2xl p-6 sm:p-8">
            <Sparkles className="h-6 w-6 text-[var(--primary)]" />
            <p className="eyebrow mt-5">{t.home.premiereCircle}</p>
            <h2 className="mt-3 text-xl font-black text-foreground">{t.home.getCloserFilms}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.home.membershipDesc}</p>
            <button type="button" onClick={() => navigate('/membership')} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)] hover:gap-3">
              {t.home.discoverMembership} <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        </section>
      </section>
    </div>
  );
};
