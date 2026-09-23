import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Coffee,
  Crown,
  Ticket,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { BannerCarousel, MarketingBannerStage } from '@/components/common/BannerCarousel';
import { SectionTabs } from '@/components/common/SectionTabs/SectionTabs';
import { DateSelector } from '@/components/common/DateSelector/DateSelector';
import { MovieGrid } from '@/components/common/MovieGrid/MovieGrid';
import { MovieCardSkeleton } from '@/components/common/Skeleton/Skeleton';
import { getCinemaDate, isUpcomingShowtime, parseShowtimeStart } from '@/lib/showtime';
import { productService } from '@/services/productService';
import type { FnbItem } from '@/types/product';
import { FeaturedFnbPreview } from './components/FeaturedFnbPreview';
import { useTranslation } from '@/i18n';

type ListingTab = 'NOW_SHOWING' | 'COMING_SOON';

const dateFormatter = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

const getDateString = (date: Date) => date.toISOString().slice(0, 10);

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { movies, showtimes, searchQuery, fetchCatalog, loading, error } = useMovieStore();
  const selectedCinemaId = useCinemaStore((state) => state.selectedCinemaId);
  const language = useSettingsStore((state) => state.language);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [activeListingTab, setActiveListingTab] = useState<ListingTab>('NOW_SHOWING');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [featuredFnb, setFeaturedFnb] = useState<FnbItem[]>([]);
  const [fnbLoading, setFnbLoading] = useState(true);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setFeaturedFnb([]);
      setFnbLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setFnbLoading(true);
    productService
      .getFeaturedFnbItems(6)
      .then((items) => {
        if (!cancelled) setFeaturedFnb(items);
      })
      .catch(() => {
        if (!cancelled) setFeaturedFnb([]);
      })
      .finally(() => {
        if (!cancelled) setFnbLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const today = getCinemaDate();

  const upcomingShowtimes = useMemo(() => {
    return showtimes
      .filter((showtime) => isUpcomingShowtime(showtime))
      .filter((showtime) => selectedCinemaId === 'ALL' || showtime.cinemaId === selectedCinemaId)
      .sort((first, second) => parseShowtimeStart(first.startTime) - parseShowtimeStart(second.startTime));
  }, [showtimes, selectedCinemaId]);

  const availableDates = useMemo(() => {
    return [...new Set(upcomingShowtimes.map((showtime) => showtime.date))];
  }, [upcomingShowtimes]);

  const dateCards = useMemo(() => {
    const firstDate = new Date(`${today}T12:00:00Z`);
    const dates = Array.from({ length: 7 }, (_, index) => {
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
    setSelectedDate((current) => (dateCards.some((date) => date.dateStr === current) ? current : firstBookableDate));
  }, [availableDates, dateCards, today]);

  const selectedDateShowtimes = useMemo(() => {
    return upcomingShowtimes.filter((showtime) => showtime.date === selectedDate);
  }, [selectedDate, upcomingShowtimes]);

  const selectedMovieIds = useMemo(() => {
    return new Set(selectedDateShowtimes.map((showtime) => showtime.movieId));
  }, [selectedDateShowtimes]);

  const comingSoonMonths = useMemo(() => {
    return [...new Set(movies.filter((movie) => movie.status === 'COMING_SOON').map((movie) => movie.releaseDate.slice(0, 7)))]
      .sort()
      .slice(0, 6);
  }, [movies]);

  const monthCards = useMemo(() => {
    return comingSoonMonths.map((month) => ({
      id: month,
      label: new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${month}-01T12:00:00Z`)),
    }));
  }, [comingSoonMonths, language]);

  useEffect(() => {
    setSelectedMonth((current) => (comingSoonMonths.includes(current) ? current : (comingSoonMonths[0] ?? '')));
  }, [comingSoonMonths]);

  const filteredMovies = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const hasDateListings = activeListingTab === 'NOW_SHOWING' && selectedDate !== '';
    return movies.filter((movie) => {
      const matchesListing =
        movie.status === activeListingTab || (activeListingTab === 'NOW_SHOWING' && movie.status === 'FEATURED');
      const matchesDate = !hasDateListings || selectedMovieIds.has(movie.id);
      const matchesMonth =
        activeListingTab !== 'COMING_SOON' || !selectedMonth || movie.releaseDate.startsWith(selectedMonth);
      const matchesSearch =
        !normalizedSearch ||
        movie.title.toLowerCase().includes(normalizedSearch) ||
        movie.genres.some((genre) => genre.toLowerCase().includes(normalizedSearch));
      return matchesListing && matchesDate && matchesMonth && matchesSearch;
    });
  }, [activeListingTab, movies, searchQuery, selectedDate, selectedMonth, selectedMovieIds]);

  const nowShowingCount = useMemo(
    () => movies.filter((m) => m.status === 'NOW_SHOWING' || m.status === 'FEATURED').length,
    [movies],
  );
  const comingSoonCount = useMemo(
    () => movies.filter((m) => m.status === 'COMING_SOON').length,
    [movies],
  );

  return (
    <div className="home-page min-h-screen overflow-hidden bg-background pb-20 text-foreground">
      <MarketingBannerStage section="HOME" autoPlayInterval={5000} showCaptions={false} />

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

      <section id="home-movies" className="container-main scroll-mt-24 pt-12 sm:pt-16">
        {/* Listing Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <SectionTabs
            tabs={[
              { id: 'NOW_SHOWING', label: t.home.nowShowing, count: nowShowingCount },
              { id: 'COMING_SOON', label: t.home.comingSoon, count: comingSoonCount },
            ]}
            activeTab={activeListingTab}
            onTabChange={(tab) => setActiveListingTab(tab as ListingTab)}
            variant="home"
          />
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Date / Month Picker */}
            <div
              className="mt-6 mb-8"
              role="tabpanel"
              id={`panel-${activeListingTab}`}
              aria-labelledby={`tab-${activeListingTab}`}
            >
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
                      className={`h-16 min-w-[130px] snap-start rounded-xl border px-4 py-2 text-sm font-black transition-colors duration-200 hover:border-foreground/40 ${
                        selectedMonth === month.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-foreground shadow-[0_0_20px_rgba(225,29,46,0.25)]'
                          : 'border-border bg-card/60 text-muted-foreground'
                      }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Movie Grid */}
            <MovieGrid
              key={`${activeListingTab}-${selectedDate}-${searchQuery}`}
              movies={filteredMovies}
              onMovieClick={(movie) => navigate(`/movies/${movie.id}`)}
              emptyMessage={activeListingTab === 'COMING_SOON' ? t.home.noUpcoming : t.home.noFilmsMatch}
              className="mt-6"
              variant="home"
            />
          </>
        )}

        {/* 4. Popular Food & Drinks Section (5-6 products, 3 cols, realistic prices, + Add on hover) */}
        <div className="mt-16 border-t border-border pt-4">
          <FeaturedFnbPreview items={featuredFnb} loading={fnbLoading} />
        </div>

        {/* 5. Bottom Promo Cards: Pre-order & Premiere Circle */}
        <section className="grid gap-6 pb-12 pt-8 md:grid-cols-[1.2fr_0.8fr]" aria-label="Cinema experiences">
          {/* Card 1: Seats, Snacks, and a Story (Pre-order for pickup) */}
          <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div className="relative z-10 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E50914]">
                CONCESSION PRE-ORDER
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Seats, Snacks &amp; A Great Story
              </h2>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Skip the lobby queues. Pre-order your favorite butter popcorn, nachos, and cold fountain beverages for express counter pickup when you arrive.
              </p>
              <button
                type="button"
                onClick={() => navigate('/fnb')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:border-[#E50914] hover:bg-[#E50914] text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>Pre-order for pickup</span>
                <Coffee className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border-[28px] border-primary/5 transition-transform duration-500 group-hover:scale-110" />
          </article>

          {/* Card 2: Premiere Circle Membership (With large luxury gold Crown badge) */}
          <article className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-card via-amber-500/[0.04] to-amber-500/[0.08] p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10 mb-4">
                <Crown className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                PREMIERE CIRCLE VIP
              </p>
              <h2 className="mt-2 text-xl sm:text-2xl font-black text-foreground">
                Get Closer To The Films You Love
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Unlock 10% off tickets, free birthday popcorn, VIP lounge access, and exclusive advance screening invitations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/membership')}
              className="mt-6 inline-flex items-center gap-2 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Discover Membership Benefits</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        </section>
      </section>

      <section className="container-main my-10 sm:my-12" aria-labelledby="whats-new-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="whats-new-title" className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            What's new?
          </h2>
        </div>

        <BannerCarousel
          section="OFFER"
          autoPlayInterval={6000}
        />
      </section>
    </div>
  );
};
