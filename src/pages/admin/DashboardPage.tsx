import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Ticket,
  CalendarClock,
  Armchair,
  AlertTriangle,
  Plus,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Info,
  CreditCard,
  Grid3X3,
  List,
  Filter,
  Film,
  Trophy,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useMovieStore } from '@/store/movieStore';
import { useBookingAdminStore } from '@/store/bookingAdminStore';
import { usePaymentStore } from '@/store/paymentStore';
import { Booking } from '@/types/booking';
import { BookingSeat as ApiBookingSeat } from '@/types/bookingSeat';
import { Screen } from '@/types/screen';
import { Show } from '@/types/show';
import { Seat as ApiSeat } from '@/types/seat';
import { bookingSeatService } from '@/services/bookingSeatService';
import { getApiErrorMessage } from '@/services/apiClient';
import { screenService } from '@/services/screenService';
import { seatService } from '@/services/seatService';
import { showService } from '@/services/showService';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

type ChartRange = 'today' | 'this_week' | 'this_month' | 'this_year' | 'all_time';

const RANGES: { value: ChartRange; label: string; description: string }[] = [
  { value: 'today', label: 'Today', description: "Today's hourly revenue & booking breakdown" },
  { value: 'this_week', label: 'This Week', description: 'Revenue & bookings for this week (Mon - Sun)' },
  { value: 'this_month', label: 'This Month', description: 'Weekly revenue & bookings for this month' },
  { value: 'this_year', label: 'This Year', description: 'Monthly revenue & bookings for this year' },
  { value: 'all_time', label: 'All Time', description: 'Historical revenue & bookings by year' },
];

const TIME_SLOTS = [
  { label: '10-12', fullLabel: '10:00 - 12:00', startHour: 10, endHour: 12 },
  { label: '12-14', fullLabel: '12:00 - 14:00', startHour: 12, endHour: 14 },
  { label: '14-16', fullLabel: '14:00 - 16:00', startHour: 14, endHour: 16 },
  { label: '16-18', fullLabel: '16:00 - 18:00', startHour: 16, endHour: 18 },
  { label: '18-20', fullLabel: '18:00 - 20:00', startHour: 18, endHour: 20 },
  { label: '20-22', fullLabel: '20:00 - 22:00', startHour: 20, endHour: 22 },
  { label: '22-00', fullLabel: '22:00 - 00:00', startHour: 22, endHour: 24 },
];

interface ChartBucket {
  label: string;
  key: string;
  revenue: number;
  count: number;
}

interface OccupancyRow {
  screenId: number;
  hall: string;
  movieTitle: string;
  format: string;
  occupied: number;
  capacity: number;
  percent: number;
  nextTime: string;
  startHour: number;
}

interface Kpi {
  key: string;
  title: string;
  value: string;
  sub: string;
  icon: typeof DollarSign;
  iconClass: string;
  iconBg: string;
  deltaText: string;
  positive: boolean;
  spark: number[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: number | string;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
}

const CustomRevenueTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const revenueItem = payload.find((p) => p.dataKey === 'revenue');
  const countItem = payload.find((p) => p.dataKey === 'count');

  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1.5 min-w-[150px]">
      <p className="font-bold text-foreground border-b border-border pb-1">{label}</p>
      {revenueItem && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[#E50914]" />
            Revenue
          </span>
          <span className="font-bold text-foreground">{formatCurrency(Number(revenueItem.value ?? 0))}</span>
        </div>
      )}
      {countItem && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            Bookings
          </span>
          <span className="font-bold text-foreground">{countItem.value}</span>
        </div>
      )}
    </div>
  );
};

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  const itemPercent = (data.payload as { percent?: number })?.percent ?? 0;

  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs space-y-0.5">
      <p className="font-bold text-foreground flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color || '#fff' }} />
        {data.name}
      </p>
      <p className="text-muted-foreground">
        {data.value} bookings ({itemPercent}%)
      </p>
    </div>
  );
};

function getScreenLabel(screen: Screen, screens: Screen[]): string {
  if (screen.screenType.toUpperCase() !== 'IMAX') return screen.name;

  const imaxNumber = screens
    .filter((candidate) => candidate.screenType.toUpperCase() === 'IMAX')
    .findIndex((candidate) => candidate.id === screen.id);

  return `IMAX Theater ${imaxNumber + 1}`;
}

function buildChartData(bookings: Booking[], range: ChartRange): ChartBucket[] {
  const now = new Date();
  const buckets: ChartBucket[] = [];

  if (range === 'today') {
    const intervals = [
      { label: '00:00 - 04:00', shortLabel: '04:00', minH: 0, maxH: 4, key: 'h0-4' },
      { label: '04:00 - 08:00', shortLabel: '08:00', minH: 4, maxH: 8, key: 'h4-8' },
      { label: '08:00 - 12:00', shortLabel: '12:00', minH: 8, maxH: 12, key: 'h8-12' },
      { label: '12:00 - 16:00', shortLabel: '16:00', minH: 12, maxH: 16, key: 'h12-16' },
      { label: '16:00 - 20:00', shortLabel: '20:00', minH: 16, maxH: 20, key: 'h16-20' },
      { label: '20:00 - 24:00', shortLabel: '23:59', minH: 20, maxH: 24, key: 'h20-24' },
    ];
    intervals.forEach((inv) => {
      buckets.push({
        label: inv.shortLabel,
        key: inv.key,
        revenue: 0,
        count: 0,
      });
    });

    const todayStr = now.toDateString();
    bookings
      .filter((b) => b.status === 'CONFIRMED')
      .forEach((b) => {
        const d = new Date(b.bookingDate);
        if (Number.isNaN(d.getTime())) return;
        if (d.toDateString() !== todayStr) return;
        const hour = d.getHours();
        const matched = intervals.find((inv) => hour >= inv.minH && hour < inv.maxH);
        if (matched) {
          const bucket = buckets.find((x) => x.key === matched.key);
          if (bucket) {
            bucket.revenue += b.totalAmount;
            bucket.count += 1;
          }
        }
      });
    return buckets;
  }

  if (range === 'this_week') {
    const currentDay = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDay);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      buckets.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        key: d.toDateString(),
        revenue: 0,
        count: 0,
      });
    }

    bookings
      .filter((b) => b.status === 'CONFIRMED')
      .forEach((b) => {
        const d = new Date(b.bookingDate);
        if (Number.isNaN(d.getTime())) return;
        const bucket = buckets.find((x) => x.key === d.toDateString());
        if (bucket) {
          bucket.revenue += b.totalAmount;
          bucket.count += 1;
        }
      });
    return buckets;
  }

  if (range === 'this_month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const weeks = [
      { label: 'W1 (1-7)', key: 'w1', minDay: 1, maxDay: 7 },
      { label: 'W2 (8-14)', key: 'w2', minDay: 8, maxDay: 14 },
      { label: 'W3 (15-21)', key: 'w3', minDay: 15, maxDay: 21 },
      { label: 'W4 (22-28)', key: 'w4', minDay: 22, maxDay: 28 },
    ];
    if (lastDate > 28) {
      weeks.push({ label: `W5 (29-${lastDate})`, key: 'w5', minDay: 29, maxDay: lastDate });
    }

    weeks.forEach((w) => {
      buckets.push({
        label: w.label,
        key: w.key,
        revenue: 0,
        count: 0,
      });
    });

    bookings
      .filter((b) => b.status === 'CONFIRMED')
      .forEach((b) => {
        const d = new Date(b.bookingDate);
        if (Number.isNaN(d.getTime())) return;
        if (d.getFullYear() !== year || d.getMonth() !== month) return;
        const day = d.getDate();
        const matched = weeks.find((w) => day >= w.minDay && day <= w.maxDay);
        if (matched) {
          const bucket = buckets.find((x) => x.key === matched.key);
          if (bucket) {
            bucket.revenue += b.totalAmount;
            bucket.count += 1;
          }
        }
      });
    return buckets;
  }

  if (range === 'this_year') {
    const currentYear = now.getFullYear();
    for (let m = 0; m < 12; m++) {
      const d = new Date(currentYear, m, 1);
      buckets.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        key: `${currentYear}-${m}`,
        revenue: 0,
        count: 0,
      });
    }

    bookings
      .filter((b) => b.status === 'CONFIRMED')
      .forEach((b) => {
        const d = new Date(b.bookingDate);
        if (Number.isNaN(d.getTime())) return;
        if (d.getFullYear() !== currentYear) return;
        const key = `${currentYear}-${d.getMonth()}`;
        const bucket = buckets.find((x) => x.key === key);
        if (bucket) {
          bucket.revenue += b.totalAmount;
          bucket.count += 1;
        }
      });
    return buckets;
  }

  // all_time (past 5 years up to current year)
  const currentYear = now.getFullYear();
  for (let y = currentYear - 4; y <= currentYear; y++) {
    buckets.push({
      label: String(y),
      key: String(y),
      revenue: 0,
      count: 0,
    });
  }

  bookings
    .filter((b) => b.status === 'CONFIRMED')
    .forEach((b) => {
      const d = new Date(b.bookingDate);
      if (Number.isNaN(d.getTime())) return;
      const key = String(d.getFullYear());
      const bucket = buckets.find((x) => x.key === key);
      if (bucket) {
        bucket.revenue += b.totalAmount;
        bucket.count += 1;
      }
    });

  return buckets;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, showtimes, bookings, fetchCatalog, fetchBookings } = useMovieStore();
  const {
    bookings: adminBookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchAll: fetchAdminBookings,
  } = useBookingAdminStore();
  const { payments, loading: paymentsLoading, fetchAll: fetchPayments } = usePaymentStore();

  const [range, setRange] = useState<ChartRange>('this_week');
  const [activityTab, setActivityTab] = useState<'bookings' | 'payments'>('bookings');
  const [activityStatusFilter, setActivityStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [occupancyView, setOccupancyView] = useState<'heatmap' | 'list'>('heatmap');

  const [liveShows, setLiveShows] = useState<Show[]>([]);
  const [liveScreens, setLiveScreens] = useState<Screen[]>([]);
  const [liveSeats, setLiveSeats] = useState<ApiSeat[]>([]);
  const [liveBookingSeats, setLiveBookingSeats] = useState<ApiBookingSeat[]>([]);
  const [occupancyLoading, setOccupancyLoading] = useState(false);
  const [occupancyError, setOccupancyError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminBookings();
    void fetchCatalog();
    void fetchBookings();
    void fetchPayments();
  }, [fetchAdminBookings, fetchCatalog, fetchBookings, fetchPayments]);

  const fetchOccupancyData = useCallback(async () => {
    setOccupancyLoading(true);
    setOccupancyError(null);

    try {
      const [shows, screens, seats, bookingSeats] = await Promise.all([
        showService.list(),
        screenService.list(),
        seatService.list(),
        bookingSeatService.list(),
      ]);

      setLiveShows(shows);
      setLiveScreens(screens);
      setLiveSeats(seats);
      setLiveBookingSeats(bookingSeats);
    } catch (error) {
      setOccupancyError(getApiErrorMessage(error, 'screen occupancy'));
    } finally {
      setOccupancyLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOccupancyData();
  }, [fetchOccupancyData]);

  // Screen Occupancy Calculation
  const occupancy: OccupancyRow[] = useMemo(() => {
    const activeScreens = liveScreens.filter(
      (screen) => !['CLOSED', 'INACTIVE', 'MAINTENANCE'].includes(screen.status.toUpperCase()),
    );
    const screenById = new Map(activeScreens.map((screen) => [screen.id, screen]));
    const seatById = new Map(liveSeats.map((seat) => [seat.id, seat]));
    const bookingSeatsByBooking = new Map<number, ApiBookingSeat[]>();

    liveBookingSeats.forEach((bookingSeat) => {
      const seatsForBooking = bookingSeatsByBooking.get(bookingSeat.bookingId) ?? [];
      seatsForBooking.push(bookingSeat);
      bookingSeatsByBooking.set(bookingSeat.bookingId, seatsForBooking);
    });

    const scheduledShows = liveShows
      .filter((show) => show.status.toUpperCase() !== 'CANCELLED' && screenById.has(show.screenId))
      .sort((left, right) => left.startTime.localeCompare(right.startTime));

    const rowsForShow = (show: Show, screen: Screen): OccupancyRow => {
      const occupiedSeatIds = new Set<number>();

      adminBookings
        .filter((booking) => booking.showId === show.id && booking.status.toUpperCase() !== 'CANCELLED')
        .forEach((booking) => {
          (bookingSeatsByBooking.get(booking.id) ?? [])
            .filter((bookingSeat) => bookingSeat.status.toUpperCase() !== 'CANCELLED')
            .forEach((bookingSeat) => {
              const seat = seatById.get(bookingSeat.seatId);
              if (seat?.screenId === screen.id) occupiedSeatIds.add(bookingSeat.seatId);
            });
        });

      const configuredCapacity = screen.totalSeats > 0 ? screen.totalSeats : 0;
      const seatCapacity = liveSeats.filter(
        (seat) => seat.screenId === screen.id && seat.status.toUpperCase() !== 'MAINTENANCE',
      ).length;
      const capacity = configuredCapacity || seatCapacity || 50;
      const occupied = occupiedSeatIds.size;
      const movie = movies.find((candidate) => String(candidate.id).replace(/^m-/, '') === String(show.movieId));
      const startDate = new Date(show.startTime);

      return {
        screenId: screen.id,
        hall: getScreenLabel(screen, activeScreens),
        movieTitle: movie?.title ?? `Movie #${show.movieId}`,
        format: screen.screenType,
        occupied,
        capacity,
        percent: capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0,
        nextTime: formatDateTime(show.startTime),
        startHour: Number.isNaN(startDate.getTime()) ? 12 : startDate.getHours(),
      };
    };

    const scheduledScreenIds = new Set(scheduledShows.map((show) => show.screenId));
    const scheduledRows = scheduledShows.map((show) => rowsForShow(show, screenById.get(show.screenId)!));
    const unscheduledRows = activeScreens
      .filter((screen) => !scheduledScreenIds.has(screen.id))
      .map((screen) => {
        const capacity = screen.totalSeats > 0
          ? screen.totalSeats
          : liveSeats.filter(
              (seat) => seat.screenId === screen.id && seat.status.toUpperCase() !== 'MAINTENANCE',
            ).length || 50;

        return {
          screenId: screen.id,
          hall: getScreenLabel(screen, activeScreens),
          movieTitle: 'No active screening scheduled',
          format: screen.screenType,
          occupied: 0,
          capacity,
          percent: 0,
          nextTime: 'No show scheduled',
          startHour: -1,
        };
      });

    return [...scheduledRows, ...unscheduledRows];
  }, [adminBookings, liveBookingSeats, liveScreens, liveSeats, liveShows, movies]);

  // 1. KPI Cards: 5 Cards with Average Order Value & Occupancy Rate %
  const cards = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
    const pending = bookings.filter((b) => b.status === 'PENDING');
    const revenue = confirmed.reduce((s, b) => s + b.totalAmount, 0);
    const avgOrderValue = confirmed.length ? revenue / confirmed.length : 0;
    const seatsSold = confirmed.reduce((s, b) => s + b.seats.length, 0);
    const bookedShare = bookings.length ? confirmed.length / bookings.length : 0;

    // Total available seats across active scheduled shows
    const activeShows = liveShows.filter((s) => s.status.toUpperCase() !== 'CANCELLED');
    const screenMap = new Map(liveScreens.map((s) => [s.id, s]));
    const totalAvailableCapacity = activeShows.reduce((sum, show) => {
      const screen = screenMap.get(show.screenId);
      const cap = screen?.totalSeats || liveSeats.filter((seat) => seat.screenId === show.screenId).length || 50;
      return sum + cap;
    }, 0);

    const overallOccupancyRate = totalAvailableCapacity > 0
      ? Math.min(100, Math.round((seatsSold / totalAvailableCapacity) * 100))
      : occupancy.length > 0
      ? Math.round(occupancy.reduce((acc, row) => acc + row.percent, 0) / occupancy.length)
      : 0;

    const kpis: Kpi[] = [
      {
        key: 'revenue',
        title: 'Revenue',
        value: formatCurrency(revenue),
        sub: `from ${confirmed.length} confirmed orders`,
        icon: DollarSign,
        iconClass: 'text-emerald-500',
        iconBg: 'bg-emerald-500/10 border-emerald-500/20',
        deltaText: `${confirmed.length} confirmed`,
        positive: true,
        spark: [2, 4, 3, 5, 6, 7, 8, 9, 8, 10, 12],
      },
      {
        key: 'bookings',
        title: 'Total Bookings',
        value: bookings.length.toString(),
        sub: `${confirmed.length} confirmed · ${pending.length} pending`,
        icon: Ticket,
        iconClass: 'text-[#E50914]',
        iconBg: 'bg-[#E50914]/10 border-[#E50914]/20',
        deltaText: `${Math.round(bookedShare * 100)}% confirmed`,
        positive: bookedShare >= 0.5,
        spark: [3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 10],
      },
      {
        key: 'aov',
        title: 'Average Order Value',
        value: formatCurrency(avgOrderValue),
        sub: `across ${confirmed.length} confirmed sales`,
        icon: CreditCard,
        iconClass: 'text-violet-500',
        iconBg: 'bg-violet-500/10 border-violet-500/20',
        deltaText: `${confirmed.length > 0 ? formatCurrency(avgOrderValue) : '$0.00'} / order`,
        positive: true,
        spark: [3, 4, 3, 5, 4, 6, 7, 6, 8, 8, 9],
      },
      {
        key: 'shows',
        title: 'Shows Scheduled',
        value: (liveShows.length || showtimes.length).toString(),
        sub: `${liveShows.length || showtimes.length ? 'in active schedule' : 'no screenings yet'}`,
        icon: CalendarClock,
        iconClass: 'text-amber-500',
        iconBg: 'bg-amber-500/10 border-amber-500/20',
        deltaText: `${cancelled.length} cancelled bookings`,
        positive: cancelled.length === 0,
        spark: [4, 4, 5, 5, 6, 5, 6, 7, 6, 7, 8],
      },
      {
        key: 'occupancy',
        title: 'Seats Sold',
        value: seatsSold.toString(),
        sub: `${overallOccupancyRate}% occupancy rate · across ${activeShows.length || 1} shows`,
        icon: Armchair,
        iconClass: 'text-cyan-500',
        iconBg: 'bg-cyan-500/10 border-cyan-500/20',
        deltaText: `${overallOccupancyRate}% avg fill`,
        positive: overallOccupancyRate >= 30,
        spark: [1, 2, 3, 2, 4, 5, 4, 6, 5, 7, 8],
      },
    ];
    return kpis;
  }, [bookings, liveShows, liveScreens, liveSeats, occupancy, showtimes]);

  // 4. Top Movies by Revenue Ranking
  const topMovies = useMemo(() => {
    const movieStats = new Map<string, {
      id: string;
      title: string;
      posterUrl: string;
      revenue: number;
      bookingsCount: number;
      seatsSold: number;
    }>();

    bookings
      .filter((b) => b.status === 'CONFIRMED')
      .forEach((b) => {
        const key = b.movieId || b.movieTitle;
        const current = movieStats.get(key) || {
          id: b.movieId || key,
          title: b.movieTitle || 'Untitled Movie',
          posterUrl: b.moviePoster || '',
          revenue: 0,
          bookingsCount: 0,
          seatsSold: 0,
        };
        current.revenue += b.totalAmount;
        current.bookingsCount += 1;
        current.seatsSold += b.seats?.length || 1;
        movieStats.set(key, current);
      });

    // Fallback if client bookings is sparse
    if (movieStats.size === 0 && adminBookings.length > 0) {
      const showMap = new Map(liveShows.map((s) => [s.id, s]));
      const movieMap = new Map(movies.map((m) => [String(m.id).replace(/^m-/, ''), m]));

      adminBookings
        .filter((b) => b.status.toUpperCase() === 'CONFIRMED')
        .forEach((b) => {
          const show = showMap.get(b.showId);
          const movie = show ? movieMap.get(String(show.movieId)) : undefined;
          const key = movie?.id || `m-${show?.movieId || b.showId}`;
          const current = movieStats.get(key) || {
            id: key,
            title: movie?.title || `Movie #${show?.movieId || b.showId}`,
            posterUrl: movie?.posterUrl || '',
            revenue: 0,
            bookingsCount: 0,
            seatsSold: 0,
          };
          current.revenue += b.totalAmount;
          current.bookingsCount += 1;
          current.seatsSold += 1;
          movieStats.set(key, current);
        });
    }

    return Array.from(movieStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [adminBookings, bookings, liveShows, movies]);

  const maxMovieRevenue = useMemo(() => {
    return Math.max(...topMovies.map((m) => m.revenue), 1);
  }, [topMovies]);

  // 5. Booking Status Breakdown (Donut Chart)
  const statusBreakdown = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    const total = confirmed + pending + cancelled || bookings.length || 1;

    return {
      data: [
        { name: 'Confirmed', value: confirmed, color: '#10b981', percent: Math.round((confirmed / total) * 100) },
        { name: 'Pending', value: pending, color: '#f59e0b', percent: Math.round((pending / total) * 100) },
        { name: 'Cancelled', value: cancelled, color: '#f43f5e', percent: Math.round((cancelled / total) * 100) },
      ],
      total: bookings.length,
      confirmed,
      pending,
      cancelled,
    };
  }, [bookings]);

  // 6. Dynamic Rules: Needs Attention Alerts
  const alerts = useMemo(() => {
    const list: { level: 'warning' | 'danger' | 'info'; text: string; url?: string }[] = [];
    const now = Date.now();
    const twoHoursFromNow = now + 2 * 60 * 60 * 1000;
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    // Rule 1: Flag shows starting in <2h with <20% capacity
    const activeScreens = liveScreens.filter(
      (screen) => !['CLOSED', 'INACTIVE', 'MAINTENANCE'].includes(screen.status.toUpperCase()),
    );
    const screenMap = new Map(activeScreens.map((s) => [s.id, s]));

    liveShows.forEach((show) => {
      if (show.status.toUpperCase() === 'CANCELLED') return;
      const showTime = new Date(show.startTime).getTime();
      if (!Number.isNaN(showTime) && showTime > now && showTime <= twoHoursFromNow) {
        const screen = screenMap.get(show.screenId);
        if (!screen) return;
        const matchingOccupancy = occupancy.find((o) => o.screenId === screen.id);
        const percent = matchingOccupancy?.percent ?? 0;
        if (percent < 20) {
          const minutesLeft = Math.max(1, Math.round((showTime - now) / 60000));
          const movie = movies.find((m) => String(m.id).replace(/^m-/, '') === String(show.movieId));
          list.push({
            level: 'warning',
            text: `Show "${movie?.title ?? `Movie #${show.movieId}`}" in ${screen.name} starts in ${minutesLeft}m with low capacity (${percent}%)`,
            url: '/admin/shows',
          });
        }
      }
    });

    // Rule 2: Flag active screens with 0 shows scheduled in next 7 days
    activeScreens.forEach((screen) => {
      const scheduledIn7Days = liveShows.filter((show) => {
        if (show.screenId !== screen.id || show.status.toUpperCase() === 'CANCELLED') return false;
        const time = new Date(show.startTime).getTime();
        return !Number.isNaN(time) && time >= now && time <= sevenDaysFromNow;
      });

      if (scheduledIn7Days.length === 0) {
        list.push({
          level: 'danger',
          text: `Screen "${screen.name}" (${screen.screenType}) has 0 shows scheduled in the next 7 days`,
          url: '/admin/shows',
        });
      }
    });

    // Rule 3: Flag pending payments older than 24 hours
    const stalePendingPayments = payments.filter((p) => {
      if (p.status !== 'PENDING') return false;
      const rawDate = p.expiresAt || p.paidAt || (p as unknown as { createdAt?: string }).createdAt;
      if (!rawDate) return false;
      const t = new Date(rawDate).getTime();
      return !Number.isNaN(t) && now - t > 24 * 60 * 60 * 1000;
    });

    if (stalePendingPayments.length > 0) {
      list.push({
        level: 'danger',
        text: `${stalePendingPayments.length} pending payment${stalePendingPayments.length > 1 ? 's' : ''} older than 24h require attention or cancellation`,
        url: '/admin/payments',
      });
    }

    // Additional checks: Cancelled bookings & high occupancy
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    if (cancelled > 0) {
      list.push({
        level: 'warning',
        text: `${cancelled} cancelled booking${cancelled > 1 ? 's' : ''} need review`,
        url: '/admin/bookings',
      });
    }

    const nearlyFull = occupancy.filter((o) => o.percent >= 85);
    if (nearlyFull.length > 0) {
      list.push({
        level: 'info',
        text: `${nearlyFull.length} screen${nearlyFull.length > 1 ? 's' : ''} are nearly full (≥85% capacity)`,
      });
    }

    if (list.length === 0) {
      list.push({ level: 'info', text: 'All screens, payments, and schedules are operating smoothly. No alerts.' });
    }
    return list;
  }, [bookings, liveScreens, liveShows, movies, occupancy, payments]);

  // Chart data calculation
  const chartData = useMemo(() => buildChartData(bookings, range), [bookings, range]);
  const chartTotal = chartData.reduce((s, d) => s + d.revenue, 0);
  const chartTotalBookings = chartData.reduce((s, d) => s + d.count, 0);

  // 7. Recent Activity Table with Status Filter
  const filteredBookings = useMemo(() => {
    let list = [...adminBookings];
    if (activityStatusFilter !== 'ALL') {
      list = list.filter((b) => b.status.toUpperCase() === activityStatusFilter);
    }
    return list.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()).slice(0, 8);
  }, [activityStatusFilter, adminBookings]);

  const filteredPayments = useMemo(() => {
    let list = [...payments];
    if (activityStatusFilter === 'CONFIRMED') {
      list = list.filter((p) => p.status === 'PAID');
    } else if (activityStatusFilter === 'PENDING') {
      list = list.filter((p) => p.status === 'PENDING');
    } else if (activityStatusFilter === 'CANCELLED') {
      list = list.filter((p) => p.status === 'FAILED' || p.status === 'EXPIRED');
    }
    return list
      .sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime() || b.id - a.id)
      .slice(0, 8);
  }, [activityStatusFilter, payments]);

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'CONFIRMED' || s === 'PAID') return <Badge variant="success" size="sm">Confirmed</Badge>;
    if (s === 'CANCELLED' || s === 'FAILED' || s === 'EXPIRED') return <Badge variant="destructive" size="sm">Cancelled</Badge>;
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  const getAmountClass = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'CONFIRMED' || s === 'PAID') return 'text-emerald-400 font-semibold';
    if (s === 'PENDING') return 'text-amber-400 font-semibold';
    return 'text-rose-400 font-semibold line-through opacity-80';
  };

  const activeScreensList = useMemo(() => {
    return liveScreens.filter(
      (screen) => !['CLOSED', 'INACTIVE', 'MAINTENANCE'].includes(screen.status.toUpperCase()),
    );
  }, [liveScreens]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Overview &amp; Analytics</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System
          </div>
          <Button size="sm" onClick={() => navigate('/admin/movies/create')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Movie
          </Button>
        </div>
      </div>

      {/* 1. KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.positive ? TrendingUp : TrendingDown;
          return (
            <div
              key={stat.key}
              className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-sm hover:border-[#E50914]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground truncate">{stat.title}</span>
                <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', stat.iconBg)}>
                  <Icon className={cn('w-4 h-4', stat.iconClass)} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tracking-tight truncate">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={stat.sub}>{stat.sub}</p>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground truncate">
                  <TrendIcon className={cn('w-3 h-3 shrink-0', stat.positive ? 'text-emerald-500' : 'text-rose-500')} />
                  {stat.deltaText}
                </span>
                {/* Sparkline */}
                <svg viewBox="0 0 40 18" className="w-14 h-5 shrink-0" aria-hidden="true">
                  <polyline
                    points={stat.spark.map((v, i) => `${(i / (stat.spark.length - 1)) * 38} ${14 - (v / 12) * 12}`).join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={stat.positive ? 'text-emerald-500' : 'text-rose-500'}
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Revenue Chart (2 cols) & Booking Status Breakdown (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Dual-Axis Revenue & Bookings Combo Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground tracking-tight">Box Office Revenue &amp; Bookings</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20">
                  Dual-Axis
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {RANGES.find((r) => r.value === range)?.description ?? 'Revenue & bookings overview'}
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
                    range === r.value
                      ? 'bg-[#E50914] text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics summary & legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(chartTotal)}</p>
                <p className="text-[11px] text-muted-foreground">Total Period Revenue</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xl font-bold text-cyan-400 tracking-tight">{chartTotalBookings}</p>
                <p className="text-[11px] text-muted-foreground">Total Bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-[#E50914]" />
                Revenue (Left Axis)
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-3 h-1 bg-[#38bdf8] rounded-full" />
                Bookings (Right Axis)
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <EmptyState title="No revenue data" hint="Add confirmed bookings to see the chart." />
          ) : (
            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#27272a' }}
                  />
                  <YAxis
                    yAxisId="revenue"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#27272a' }}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                  />
                  <YAxis
                    yAxisId="count"
                    orientation="right"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomRevenueTooltip />} />
                  <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="#E50914"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="count"
                    type="monotone"
                    dataKey="count"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#38bdf8', stroke: '#09090b', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#38bdf8' }}
                    name="Bookings"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 5. Booking Status Breakdown (Donut Chart) */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">Booking Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Status distribution</p>
            </div>
            <Ticket className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="relative w-full h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground">{statusBreakdown.total}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Status Breakdown Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            {statusBreakdown.data.map((item) => (
              <div
                key={item.name}
                className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border text-center"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{item.value}</span>
                <span className="text-[10px] text-muted-foreground">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Screen Occupancy (Heatmap / List) (2 cols) & Top Movies by Revenue (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Screen Occupancy Heatmap & List */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">Screen Occupancy</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {occupancyView === 'heatmap' ? 'Live slot-by-slot capacity heatmap' : 'Current screening fill rates'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setOccupancyView('heatmap')}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors',
                    occupancyView === 'heatmap' ? 'bg-[#E50914] text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Grid3X3 className="w-3 h-3" />
                  Heatmap
                </button>
                <button
                  type="button"
                  onClick={() => setOccupancyView('list')}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors',
                    occupancyView === 'list' ? 'bg-[#E50914] text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <List className="w-3 h-3" />
                  List
                </button>
              </div>
            </div>
          </div>

          {occupancyLoading || bookingsLoading ? (
            <EmptyState title="Loading occupancy" hint="Fetching screening and seat fill rates." />
          ) : occupancyError || bookingsError ? (
            <div className="space-y-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <p className="text-xs text-rose-500">{occupancyError ?? bookingsError}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  void Promise.all([fetchOccupancyData(), fetchAdminBookings()]);
                }}
              >
                Retry
              </Button>
            </div>
          ) : activeScreensList.length === 0 ? (
            <EmptyState title="No active screens" hint="Screens will appear here when configured." />
          ) : occupancyView === 'heatmap' ? (
            /* Heatmap Matrix */
            <div className="space-y-3 overflow-x-auto">
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground pb-2 w-32">
                      Screen / Hall
                    </th>
                    {TIME_SLOTS.map((slot) => (
                      <th key={slot.label} className="text-center text-[10px] font-semibold text-muted-foreground pb-2 px-1">
                        {slot.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {activeScreensList.map((screen) => {
                    const screenRows = occupancy.filter((o) => o.screenId === screen.id);
                    return (
                      <tr key={screen.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 pr-3">
                          <p className="text-xs font-bold text-foreground truncate">{screen.name}</p>
                          <span className="text-[10px] text-muted-foreground">{screen.screenType}</span>
                        </td>
                        {TIME_SLOTS.map((slot) => {
                          const matchedShow = screenRows.find(
                            (r) => r.startHour >= slot.startHour && r.startHour < slot.endHour,
                          );
                          const percent = matchedShow?.percent ?? 0;
                          return (
                            <td key={slot.label} className="p-1 text-center">
                              <div
                                className={cn(
                                  'relative group h-11 rounded-lg border flex flex-col items-center justify-center p-1 transition-all cursor-pointer',
                                  matchedShow
                                    ? percent >= 75
                                      ? 'bg-[#E50914] border-red-500 text-white font-bold shadow-sm shadow-red-500/30 hover:brightness-110'
                                      : percent >= 50
                                      ? 'bg-[#E50914]/70 border-red-500/60 text-white font-semibold hover:bg-[#E50914]/80'
                                      : percent >= 25
                                      ? 'bg-[#E50914]/40 border-red-500/40 text-rose-100 font-medium hover:bg-[#E50914]/50'
                                      : 'bg-[#E50914]/15 border-red-500/20 text-rose-300 hover:bg-[#E50914]/25'
                                    : 'bg-muted/20 border-dashed border-border/40 text-muted-foreground/30 hover:bg-muted/40',
                                )}
                              >
                                {matchedShow ? (
                                  <>
                                    <span className="text-xs font-bold leading-tight">{percent}%</span>
                                    <span className="text-[9px] opacity-80 leading-none">
                                      {matchedShow.occupied}/{matchedShow.capacity}
                                    </span>
                                    {/* Hover Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 w-48 p-2.5 rounded-lg bg-popover/95 backdrop-blur-md border border-border shadow-2xl text-left z-30 pointer-events-none">
                                      <p className="text-xs font-bold text-foreground truncate">{matchedShow.movieTitle}</p>
                                      <p className="text-[10px] text-muted-foreground">{screen.name} · {screen.screenType}</p>
                                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                                        <span className="text-muted-foreground">Fill Rate:</span>
                                        <span className={cn('font-bold', percent >= 75 ? 'text-rose-500' : 'text-emerald-500')}>
                                          {percent}% ({matchedShow.occupied}/{matchedShow.capacity})
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground">Slot: {slot.fullLabel}</p>
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-[10px]">—</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Heatmap Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border text-[11px] text-muted-foreground">
                <span>Fill rate scale:</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#E50914]/15 border border-red-500/20" /> &lt;25%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#E50914]/40 border border-red-500/40" /> 25-50%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#E50914]/70 border border-red-500/60" /> 50-75%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-[#E50914] border border-red-500" /> &ge;75%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {occupancy.map((o, idx) => {
                const nearFull = o.percent >= 85;
                return (
                  <div
                    key={`${o.hall}-${o.nextTime}-${idx}`}
                    className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{o.hall}</span>
                      <Badge variant={nearFull ? 'warning' : 'primary'} size="sm">{o.format}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{o.movieTitle}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        {o.occupied} / {o.capacity} seats
                      </span>
                      <span className={cn('font-bold', nearFull ? 'text-rose-500' : 'text-emerald-500')}>
                        {o.percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${o.percent}%` }}
                        className={cn(
                          'h-full rounded-full',
                          nearFull ? 'bg-rose-500' : o.percent >= 60 ? 'bg-amber-500' : 'bg-emerald-500',
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CalendarClock className="w-3 h-3" />
                      Next show {o.nextTime}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/shows')}>
            Manage Shows &amp; Timetable
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        {/* 4. Top Movies by Revenue Ranking */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight">Top Movies by Revenue</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Box office ranking</p>
              </div>
            </div>
            <Film className="w-4 h-4 text-muted-foreground" />
          </div>

          {topMovies.length === 0 ? (
            <EmptyState title="No movie revenue yet" hint="Confirmed bookings will calculate ranking." />
          ) : (
            <div className="space-y-3.5 my-auto">
              {topMovies.map((movie, index) => {
                const percent = Math.round((movie.revenue / maxMovieRevenue) * 100);
                const isFirst = index === 0;
                return (
                  <div key={movie.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                            index === 0
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : index === 1
                              ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40'
                              : index === 2
                              ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[160px]" title={movie.title}>
                          {movie.title}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={cn('font-bold', isFirst ? 'text-[#E50914]' : 'text-foreground')}>
                          {formatCurrency(movie.revenue)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {movie.bookingsCount} booking{movie.bookingsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {/* Horizontal progress bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={cn(
                          'h-full rounded-full transition-all',
                          isFirst ? 'bg-gradient-to-r from-[#E50914] to-red-500' : 'bg-red-500/60',
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/admin/movies')}>
            View All Movies
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Row 4: Needs Attention (1 col) & Recent Activity (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6. Needs Attention with Dynamic Rules */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground tracking-tight">Needs Attention</h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
              {alerts.filter((a) => a.level !== 'info').length} alerts
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2.5 p-3 rounded-lg border text-xs',
                  a.level === 'danger' && 'bg-rose-500/10 border-rose-500/25',
                  a.level === 'warning' && 'bg-amber-500/10 border-amber-500/25',
                  a.level === 'info' && 'bg-muted/40 border-border',
                )}
              >
                {a.level === 'danger' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                ) : a.level === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground leading-snug">{a.text}</p>
                  {a.url && (
                    <button
                      type="button"
                      onClick={() => navigate(a.url!)}
                      className="text-[11px] font-semibold text-[#E50914] hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      Resolve now <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Recent Activity with Status Filter & Colored Amount */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground tracking-tight">Recent Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activityTab === 'bookings' ? 'Latest ticket bookings' : 'Latest payments & transactions'}
                </p>
              </div>

              {/* Bookings / Payments Toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setActivityTab('bookings')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold transition-colors',
                    activityTab === 'bookings' ? 'bg-[#E50914] text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Bookings
                </button>
                <button
                  type="button"
                  onClick={() => setActivityTab('payments')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold transition-colors',
                    activityTab === 'payments' ? 'bg-[#E50914] text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Payments
                </button>
              </div>
            </div>

            {/* Status Filter & View All */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-lg px-2 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={activityStatusFilter}
                  onChange={(e) => setActivityStatusFilter(e.target.value as 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED')}
                  aria-label="Filter activity by status"
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-card text-foreground">All Status</option>
                  <option value="CONFIRMED" className="bg-card text-foreground">Confirmed</option>
                  <option value="PENDING" className="bg-card text-foreground">Pending</option>
                  <option value="CANCELLED" className="bg-card text-foreground">Cancelled</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => navigate(activityTab === 'bookings' ? '/admin/bookings' : '/admin/payments')}
                className="text-xs font-semibold text-[#E50914] hover:underline whitespace-nowrap"
              >
                View all
              </button>
            </div>
          </div>

          {activityTab === 'bookings' ? (
            bookingsLoading ? (
              <EmptyState title="Loading recent bookings" hint="Fetching latest bookings from API." />
            ) : bookingsError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-semibold text-foreground">Unable to load recent bookings</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">{bookingsError}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => void fetchAdminBookings()}>
                  Retry
                </Button>
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState title="No bookings found" hint="No bookings match the selected status filter." />
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left text-xs min-w-[560px]">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 pr-3 font-semibold">Booking Code</th>
                      <th className="py-2.5 pr-3 font-semibold">Customer</th>
                      <th className="py-2.5 pr-3 font-semibold">Show</th>
                      <th className="py-2.5 pr-3 font-semibold">Amount</th>
                      <th className="py-2.5 pr-3 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 pr-3 font-mono font-semibold text-foreground">{b.bookingCode}</td>
                        <td className="py-3 pr-3 font-medium text-foreground">Customer #{b.customerId}</td>
                        <td className="py-3 pr-3 text-muted-foreground">Show #{b.showId}</td>
                        <td className={cn('py-3 pr-3', getAmountClass(b.status))}>{formatCurrency(b.totalAmount)}</td>
                        <td className="py-3 pr-3">{statusBadge(b.status)}</td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(b.bookedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : paymentsLoading ? (
            <EmptyState title="Loading payments" hint="Fetching recent payments from API." />
          ) : filteredPayments.length === 0 ? (
            <EmptyState title="No payments found" hint="No payments match the selected status filter." />
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 pr-3 font-semibold">Payment ID</th>
                    <th className="py-2.5 pr-3 font-semibold">Customer</th>
                    <th className="py-2.5 pr-3 font-semibold">Method</th>
                    <th className="py-2.5 pr-3 font-semibold">Amount</th>
                    <th className="py-2.5 pr-3 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-3 font-mono font-semibold text-foreground">#{p.id}</td>
                      <td className="py-3 pr-3 font-medium text-foreground">User #{p.customerId}</td>
                      <td className="py-3 pr-3">
                        <Badge variant={p.paymentMethod === 'KHQR' ? 'outline' : 'secondary'} size="sm">
                          {p.paymentMethod}
                        </Badge>
                      </td>
                      <td className={cn('py-3 pr-3', getAmountClass(p.status))}>{formatCurrency(p.amount)}</td>
                      <td className="py-3 pr-3">{statusBadge(p.status)}</td>
                      <td className="py-3 text-muted-foreground whitespace-nowrap">
                        {p.paidAt ? formatDateTime(p.paidAt) : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; hint: string }> = ({ title, hint }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
      <Info className="w-5 h-5 text-muted-foreground" />
    </div>
    <p className="text-sm font-semibold text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
  </div>
);
