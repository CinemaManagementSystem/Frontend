import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgePercent, CheckCircle2, ChevronLeft, ChevronRight, Coffee, Crown, MapPin, Popcorn, Search, Ticket } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { productService } from '@/services/productService';
import { HeroCarousel } from '@/components/common/HeroCarousel/HeroCarousel';
import { SectionTabs } from '@/components/common/SectionTabs/SectionTabs';
import { DateSelector } from '@/components/common/DateSelector/DateSelector';
import { MovieGrid } from '@/components/common/MovieGrid/MovieGrid';
import { MovieCardSkeleton } from '@/components/common/Skeleton/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { SnackImage } from '@/pages/public-site/Booking/SnackImage';
import { getCinemaDate, isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { useHeroBackdrop } from '@/context/HeroBackdropContext';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Product } from '@/types/product';
import { PROMOTIONS } from '@/pages/public-site/promotion/Promotion';
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
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0204]';

type PromotionItem = (typeof PROMOTIONS)[number];

function stripEmoji(value: string) {
  return value.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s{2,}/g, ' ').trim();
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function PromotionImage({ promotion }: { promotion: PromotionItem }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [promotion.image]);

  if (failed) {
    return (
      <div
        className="relative aspect-[16/9] bg-gradient-to-br from-red-950 via-[#231014] to-[#0d0d0f] md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[65%]"
        role="img"
        aria-label={`${stripEmoji(promotion.title)} image unavailable`}
      />
    );
  }

  return (
    <img
      src={promotion.image}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="relative aspect-[16/9] h-auto w-full object-cover object-center md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[65%]"
    />
  );
}

function WhatsNewSection() {
  const promotions = PROMOTIONS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const hasMultipleSlides = promotions.length > 1;

  useEffect(() => {
    const handleVisibility = () => setTabHidden(document.hidden);
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!hasMultipleSlides || paused || tabHidden || reducedMotion) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % promotions.length);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, hasMultipleSlides, paused, promotions.length, reducedMotion, tabHidden]);

  if (!promotions.length) return null;

  const goToSlide = (index: number) => setActiveIndex((index + promotions.length) % promotions.length);
  const handleTouchEnd = (clientX: number) => {
    if (touchStart === null || !hasMultipleSlides) return;
    const delta = clientX - touchStart;
    if (Math.abs(delta) > 45) goToSlide(activeIndex + (delta < 0 ? 1 : -1));
    setTouchStart(null);
  };

  return (
    <section className="py-12 md:py-16" aria-labelledby="whats-new-title">
      <PageContainer>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="whats-new-title" className="text-2xl font-bold text-white md:text-3xl">What's new?</h2>
          <Link to="/promotion" className={`inline-flex items-center gap-2 self-start text-sm font-semibold text-white/80 transition hover:text-white sm:self-auto ${FOCUS}`}>
            View all offers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div
          className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0f] md:min-h-[360px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
        >
          {promotions.map((promotion, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={promotion.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 flex flex-col transition-opacity duration-700 ease-out motion-reduce:transition-none md:block ${isActive ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
              >
                <PromotionImage promotion={promotion} />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-transparent to-[#0d0d0f] md:hidden" />
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[72%] bg-gradient-to-r from-[#0d0d0f] via-[#0d0d0f]/85 to-transparent md:block" />
                <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-[radial-gradient(circle_at_0%_50%,rgba(225,29,46,.25),transparent_60%)] md:block" />

                <div className="relative z-10 flex flex-1 flex-col justify-end p-6 pb-20 md:h-full md:w-[42%] md:justify-center md:p-8 md:pb-20 lg:p-10 lg:pb-20">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Promotion</p>
                  <h3 className="mt-3 line-clamp-2 text-2xl font-bold leading-tight text-white md:text-3xl">
                    {stripEmoji(promotion.title)}
                  </h3>
                  <p className="mt-4 line-clamp-3 max-w-md text-sm leading-relaxed text-neutral-300 md:text-base">
                    {stripEmoji(promotion.description)}
                  </p>
                  <Link
                    to={`/promotion/${promotion.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`mt-6 inline-flex h-11 w-fit items-center gap-2 whitespace-nowrap rounded-full bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-500 ${FOCUS}`}
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}

          {hasMultipleSlides && (
            <>
              <div className="absolute bottom-5 left-6 z-20 flex gap-2 md:left-8">
                {promotions.map((promotion, index) => (
                  <button
                    key={promotion.id}
                    type="button"
                    aria-label={`Show ${stripEmoji(promotion.title)}`}
                    aria-current={index === activeIndex}
                    onClick={() => goToSlide(index)}
                    className={`rounded-full transition-all ${index === activeIndex ? 'h-1.5 w-8 bg-red-600' : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/70'} ${FOCUS}`}
                  />
                ))}
              </div>

              <div className="absolute bottom-5 right-6 z-20 hidden gap-2 md:flex">
                <button
                  type="button"
                  aria-label="Previous promotion"
                  onClick={() => goToSlide(activeIndex - 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-black/70 ${FOCUS}`}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next promotion"
                  onClick={() => goToSlide(activeIndex + 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-black/70 ${FOCUS}`}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}

function productImageCategory(name: string): 'Popcorn' | 'Drink' | 'Combo' | 'Snacks' {
  const normalized = name.toLowerCase();
  if (normalized.includes('popcorn')) return 'Popcorn';
  if (normalized.includes('drink') || normalized.includes('cola') || normalized.includes('coke') || normalized.includes('water')) return 'Drink';
  if (normalized.includes('combo') || normalized.includes('set')) return 'Combo';
  return 'Snacks';
}

function PlanVisitSection({ products, isAuthenticated }: { products: Product[]; isAuthenticated: boolean }) {
  const quickActions = [
    { title: 'Cinemas', description: 'Find your nearest screen', to: '/cinemas', icon: MapPin },
    { title: 'Food & Drinks', description: 'Pick your movie-night combo', to: '/fnb', icon: Popcorn },
    { title: 'Offers', description: 'Browse current deals', to: '/promotion', icon: BadgePercent },
    { title: 'Membership', description: 'Unlock rewards and events', to: '/membership', icon: Crown },
  ];

  const benefits = ['Early access', 'Member events', 'Rewards'];

  return (
    <section className="border-t border-white/10 py-16 md:py-24" aria-labelledby="plan-visit-title">
      <PageContainer className="space-y-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Plan your visit</p>
            <h2 id="plan-visit-title" className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Find the right screen for your night.
            </h2>
          </div>
          <Link
            to="/cinemas"
            className={`inline-flex items-center gap-2 self-start text-sm font-semibold text-white/80 transition hover:text-white md:self-auto ${FOCUS}`}
          >
            Explore cinemas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickActions.map(({ title, description, to, icon: Icon }) => (
            <Link
              key={title}
              to={to}
              className={`group flex min-h-44 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-red-600/60 hover:bg-white/[0.06] ${FOCUS}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="space-y-1">
                <span className="block font-bold text-white">{title}</span>
                <span className="block truncate text-sm text-neutral-400">{description}</span>
              </span>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        {products.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Popular combos</h3>
              <Link to="/fnb" className={`inline-flex flex-row items-center gap-2 whitespace-nowrap text-sm font-semibold text-white/80 transition hover:text-white ${FOCUS}`}>
                View all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {products.map((product) => (
                <Link key={product.id} to="/fnb" className={`group min-w-[180px] snap-start space-y-3 rounded-xl ${FOCUS}`}>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/[0.04]">
                    <SnackImage name={product.name} category={productImageCategory(product.name)} src={product.imageUrl} />
                  </div>
                  <div>
                    <h4 className="line-clamp-1 font-semibold text-white transition group-hover:text-red-100">{product.name}</h4>
                    <p className="mt-1 font-bold text-red-500">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to="/fnb"
              className={`inline-flex flex-row items-center gap-2 whitespace-nowrap rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/85 transition hover:border-red-600/60 hover:bg-white/[0.06] hover:text-white ${FOCUS}`}
            >
              Explore food & drinks
              <Coffee className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/40 via-[#0d0d0f] to-[#0d0d0f] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Premiere circle</p>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">Get closer to the films you love.</h3>
            <ul className="mt-5 grid gap-3 text-sm text-neutral-300 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/membership"
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(225,29,46,.24)] transition hover:bg-red-500 ${FOCUS}`}
          >
            {isAuthenticated ? 'View my points' : 'Join now'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentImage } = useHeroBackdrop();
  const { movies, showtimes, searchQuery, setSearchQuery, fetchCatalog, loading, error } = useMovieStore();
  const { cinemas, selectedCinemaId } = useCinemaStore();
  const language = useSettingsStore((state) => state.language);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeListingTab, setActiveListingTab] = useState<ListingTab>('NOW_SHOWING');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPopularProducts([]);
      return;
    }
    let cancelled = false;
    void productService.list()
      .then((products) => {
        if (cancelled) return;
        setPopularProducts(products
          .filter((product) => product.isAvailable && product.stockQuantity > 0 && Number.isFinite(product.price) && product.price >= 0)
          .sort((first, second) => Number(Boolean(second.imageUrl)) - Number(Boolean(first.imageUrl)) || first.name.localeCompare(second.name))
          .slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setPopularProducts([]);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

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
    <div className="home-page min-h-screen overflow-hidden bg-transparent pb-20 text-white">
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
                <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto md:gap-6" aria-label="Coming soon months">
                  {monthCards.map((month) => (
                    <button
                      key={month.id}
                      type="button"
                      onClick={() => setSelectedMonth(month.id)}
                      aria-pressed={selectedMonth === month.id}
                      className={`h-16 min-w-[110px] snap-start rounded-lg border bg-black px-5 text-base font-bold text-white transition-colors duration-200 hover:border-white/50 ${selectedMonth === month.id ? 'border-red-600 shadow-[0_0_20px_rgba(225,29,46,.25)]' : 'border-white/20'}`}
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
              emptyMessage={activeListingTab === 'COMING_SOON' ? 'No upcoming movies this month' : 'No films match that selection'}
              className="mt-12"
              variant="home"
            />
          </>
        )}
      </section>

      <PlanVisitSection products={popularProducts} isAuthenticated={isAuthenticated} />

    </div>
  );
};
