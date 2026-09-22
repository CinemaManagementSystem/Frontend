import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Clock3, Info, MapPin, Navigation, Phone } from 'lucide-react';
import { useCinemaStore } from '@/store/cinemaStore';
import { useMovieStore } from '@/store/movieStore';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';
import { getApiErrorMessage } from '@/services/apiClient';
import { getCinemaDate, isUpcomingShowtime } from '@/lib/showtime';
import { DateSelector, type DateItem } from './components/DateSelector';
import { ShowtimeEmptyState } from './components/ShowtimeEmptyState';
import { ShowtimeResults } from './components/ShowtimeResults';
import { ShowtimeSkeleton } from './components/ShowtimeSkeleton';
import type { Showtime } from '@/types/movie';
import cinemaBanner from '@/assets/banner-cinema/cinema_banner.png';

type DetailTab = 'SHOWING' | 'DETAIL';

function dateLabel(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export const CinemaDetailPage = () => {
  const { cinemaId = '' } = useParams();
  const { cinemas, selectCinema, fetchCinemas, loading: cinemasLoading } = useCinemaStore();
  const { movies, showtimes, loading, fetchCatalog } = useMovieStore();
  const clock = useShowtimeClock();
  const [recheckTime, setRecheckTime] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('SHOWING');
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const decodedCinemaId = decodeURIComponent(cinemaId);
  const cinema = cinemas.find((item) => item.id === decodedCinemaId);
  const now = Math.max(clock, recheckTime);
  const today = getCinemaDate(now);

  const loadPage = useCallback(async () => {
    setFetchError(null);
    try {
      await Promise.all([fetchCatalog(), fetchCinemas()]);
    } catch (error) {
      setFetchError(getApiErrorMessage(error, 'cinema screenings'));
    } finally {
      setLoaded(true);
    }
  }, [fetchCatalog, fetchCinemas]);

  useEffect(() => { void loadPage(); }, [loadPage]);
  useEffect(() => {
    if (!cinema) return;
    selectCinema(cinema.id);
    document.title = `${cinema.name} | Cinematique`;
    return () => { document.title = 'Cinematique'; };
  }, [cinema, selectCinema]);

  const upcomingShows = useMemo(() => showtimes
    .filter((show) => show.cinemaId === decodedCinemaId && isUpcomingShowtime(show, now))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)), [decodedCinemaId, now, showtimes]);
  const availableDates = [...new Set(upcomingShows.map((show) => show.date))];
  const activeDate = selectedDate && selectedDate >= today ? selectedDate : availableDates[0] || today;
  const dateList: DateItem[] = [...new Set([
    ...Array.from({ length: 7 }, (_, index) => {
      const day = new Date(`${today}T12:00:00Z`);
      day.setUTCDate(day.getUTCDate() + index);
      return day.toISOString().slice(0, 10);
    }),
    ...availableDates,
  ])].sort().map((date) => ({
    dateStr: date,
    dayName: dateLabel(date, { weekday: 'short' }),
    dayNum: dateLabel(date, { day: 'numeric' }),
    monthName: dateLabel(date, { month: 'short' }),
    isToday: date === today,
    hasShowtimes: availableDates.includes(date),
  }));
  const dateShows = upcomingShows.filter((show) => show.date === activeDate);
  const showtimesByMovie = dateShows.reduce<Record<string, Showtime[]>>((groups, show) => {
    (groups[show.movieId] ??= []).push(show);
    return groups;
  }, {});
  const nextDate = availableDates.find((date) => date > activeDate);
  const busy = loading || cinemasLoading || !loaded;

  if (!cinema && busy) {
    return <div className="container-main min-h-[70vh] py-12"><div className="mx-auto h-[420px] max-w-5xl animate-pulse rounded-2xl bg-card" /></div>;
  }

  if (!cinema) {
    return (
      <main className="container-main flex min-h-[70vh] items-center justify-center py-16 text-center">
        <div>
          <MapPin className="mx-auto h-10 w-10 text-[var(--primary)]" />
          <h1 className="mt-5 text-3xl font-black">Cinema not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This cinema is unavailable or may have been removed.</p>
          <Link to="/cinemas" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white"><ArrowLeft className="h-4 w-4" />All cinemas</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-20 text-foreground">
      <section className="relative isolate overflow-hidden pb-5 pt-8 sm:pt-10">
        <div aria-hidden="true" className="absolute inset-0 -z-20 scale-125 bg-cover bg-center opacity-35 blur-3xl" style={{ backgroundImage: `url(${cinemaBanner})` }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/55 to-background" />
        <div className="container-main">
          <div className="mx-auto max-w-5xl">
            <Link to="/cinemas" className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-white/70 transition hover:text-white"><ArrowLeft className="h-4 w-4" />All cinemas</Link>
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,.5)]">
              <img src={cinemaBanner} alt="" className="absolute inset-0 h-full w-full object-cover object-center" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <h1 className="text-2xl font-black text-white drop-shadow-lg sm:text-3xl">{cinema.name}</h1>
                    <p className="mt-2 flex items-start gap-2 text-sm text-white/75"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />{cinema.address || cinema.locationName || 'Address not listed'}</p>
                    <p className="mt-4 text-xs font-medium text-white/55"><Link to="/" className="hover:text-white">Home</Link><span className="px-2">/</span><Link to="/cinemas" className="hover:text-white">Cinema</Link><span className="px-2">/</span><span className="text-white/85">{cinema.name}</span></p>
                  </div>
                  {cinema.googleMapsUrl && <a href={cinema.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-black/45 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:border-[var(--primary)]"><Navigation className="h-4 w-4 text-[var(--primary)]" />Directions<ArrowUpRight className="h-3.5 w-3.5" /></a>}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-7 pt-6" role="tablist" aria-label="Cinema information">
              <button type="button" role="tab" aria-selected={activeTab === 'SHOWING'} onClick={() => setActiveTab('SHOWING')} className={`border-b-2 px-1 pb-2 text-base font-bold transition ${activeTab === 'SHOWING' ? 'border-[var(--primary)] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Now Showing</button>
              <button type="button" role="tab" aria-selected={activeTab === 'DETAIL'} onClick={() => setActiveTab('DETAIL')} className={`border-b-2 px-1 pb-2 text-base font-bold transition ${activeTab === 'DETAIL' ? 'border-[var(--primary)] text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Detail</button>
            </div>
          </div>
        </div>
      </section>

      {activeTab === 'SHOWING' ? <>
        <DateSelector dateList={dateList} selectedDate={activeDate} onSelectDate={setSelectedDate} />
        <section className="container-main py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">Now Showing</h2>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{activeDate === today ? 'Today' : dateLabel(activeDate, { weekday: 'long', month: 'short', day: 'numeric' })} · Cambodia time (UTC+7)</p>
              </div>
              {!busy && dateShows.length > 0 && <p className="text-xs text-muted-foreground">{Object.keys(showtimesByMovie).length} {Object.keys(showtimesByMovie).length === 1 ? 'movie' : 'movies'} · {dateShows.length} {dateShows.length === 1 ? 'screening' : 'screenings'}</p>}
            </div>
            {busy ? <ShowtimeSkeleton /> : fetchError ? <ShowtimeEmptyState type="ERROR" cinemaName={cinema.name} selectedDate={activeDate} errorMessage={fetchError} onResetFilters={() => undefined} onRetry={() => void loadPage()} /> : dateShows.length ? <ShowtimeResults showtimesByMovie={showtimesByMovie} movies={movies} onShowtimeExpired={() => setRecheckTime(Date.now())} /> : <ShowtimeEmptyState type="NO_SHOWTIMES" cinemaName={cinema.name} selectedDate={activeDate} tomorrowDateStr={nextDate} onResetFilters={() => undefined} onSelectTomorrow={setSelectedDate} />}
          </div>
        </section>
      </> : (
        <section className="container-main py-10">
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,.6fr)]">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]"><Info className="h-4 w-4" />About this cinema</p>
              <h2 className="mt-3 text-3xl font-black">{cinema.name}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Find current screenings, choose a showtime, and reserve your seats online. Location and contact information are listed here for your visit.</p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              <div className="flex gap-3 py-4"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /><div><p className="text-xs font-bold">Address</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{cinema.address || cinema.locationName || 'Address not listed'}</p></div></div>
              {cinema.phone && <div className="flex gap-3 py-4"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /><div><p className="text-xs font-bold">Phone</p><a href={`tel:${cinema.phone.replace(/[^+\d]/g, '')}`} className="mt-1 block text-xs text-muted-foreground hover:text-[var(--primary)]">{cinema.phone}</a></div></div>}
              <div className="flex gap-3 py-4"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /><div><p className="text-xs font-bold">Status</p><p className="mt-1 text-xs capitalize text-muted-foreground">{cinema.status.toLowerCase()}</p></div></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
