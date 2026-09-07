import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { Showtime } from '@/types/movie';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { MovieForm } from '@/components/forms/MovieForm/MovieForm';
import { Button } from '@/components/ui/Button/Button';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatDate';
import { cn } from '@/lib/utils';

type ChartRange = '7D' | '30D' | '12M';

const RANGES: { value: ChartRange; label: string }[] = [
  { value: '7D', label: '7 Days' },
  { value: '30D', label: '30 Days' },
  { value: '12M', label: '12 Months' },
];

interface ChartBucket {
  label: string;
  key: string;
  revenue: number;
  count: number;
}

interface OccupancyRow {
  hall: string;
  movieTitle: string;
  format: string;
  occupied: number;
  capacity: number;
  percent: number;
  nextTime: string;
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

function inferHallCapacities(showtimes: Showtime[]): Record<string, number> {
  const seen: Record<string, { row: number; col: number }> = {};
  showtimes.forEach((st) => {
    st.occupiedSeats.forEach((seat) => {
      const m = seat.match(/^([A-Z])(\d+)$/);
      if (!m) return;
      const row = m[1].charCodeAt(0) - 64;
      const col = parseInt(m[2], 10);
      const cur = seen[st.hallName] || { row: 0, col: 0 };
      seen[st.hallName] = { row: Math.max(cur.row, row), col: Math.max(cur.col, col) };
    });
  });
  const cap: Record<string, number> = {};
  Object.entries(seen).forEach(([hall, r]) => {
    cap[hall] = r.row > 0 && r.col > 0 ? r.row * r.col : 80;
  });
  return cap;
}

function buildChartData(bookings: Booking[], range: ChartRange): ChartBucket[] {
  const now = new Date();
  const buckets: ChartBucket[] = [];

  if (range === '7D') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        key: d.toDateString(),
        revenue: 0,
        count: 0,
      });
    }
  } else if (range === '30D') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        key: d.toDateString(),
        revenue: 0,
        count: 0,
      });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        key: `${d.getFullYear()}-${d.getMonth()}`,
        revenue: 0,
        count: 0,
      });
    }
  }

  bookings
    .filter((b) => b.status === 'CONFIRMED')
    .forEach((b) => {
      const d = new Date(b.bookingDate);
      if (Number.isNaN(d.getTime())) return;
      const key =
        range === '12M'
          ? `${d.getFullYear()}-${d.getMonth()}`
          : d.toDateString();
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
  const { movies, showtimes, bookings, addMovie } = useMovieStore();
  const [addMovieModalOpen, setAddMovieModalOpen] = useState(false);
  const [range, setRange] = useState<ChartRange>('7D');

  const cards = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED');
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
    const pending = bookings.filter((b) => b.status === 'PENDING');
    const revenue = confirmed.reduce((s, b) => s + b.totalAmount, 0);
    const avgTicket = confirmed.length ? revenue / confirmed.length : 0;
    const seatsSold = confirmed.reduce((s, b) => s + b.seats.length, 0);
    const bookedShare = bookings.length ? confirmed.length / bookings.length : 0;

    const kpis: Kpi[] = [
      {
        key: 'revenue',
        title: 'Revenue',
        value: formatCurrency(revenue),
        sub: `avg ${formatCurrency(avgTicket)} / ticket`,
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
        key: 'shows',
        title: 'Shows Scheduled',
        value: showtimes.length.toString(),
        sub: `${showtimes.length ? 'in current schedule' : 'no screenings yet'}`,
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
        sub: `across ${showtimes.length} shows`,
        icon: Armchair,
        iconClass: 'text-cyan-500',
        iconBg: 'bg-cyan-500/10 border-cyan-500/20',
        deltaText: `${bookings.length} bookings total`,
        positive: true,
        spark: [1, 2, 3, 2, 4, 5, 4, 6, 5, 7, 8],
      },
    ];
    return kpis;
  }, [bookings, showtimes]);

  const hallCapacities = useMemo(
    () => inferHallCapacities(showtimes),
    [showtimes],
  );

  const occupancy: OccupancyRow[] = useMemo(() => {
    return showtimes.map((st) => {
      const movie = movies.find((m) => m.id === st.movieId);
      const capacity = hallCapacities[st.hallName] ?? 80;
      const occupied = st.occupiedSeats.length;
      return {
        hall: st.hallName,
        movieTitle: movie?.title ?? 'Unknown movie',
        format: st.format,
        occupied,
        capacity,
        percent: capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0,
        nextTime: st.time,
      };
    });
  }, [showtimes, hallCapacities, movies]);

  const alerts = useMemo(() => {
    const list: { level: 'warning' | 'danger' | 'info'; text: string; url?: string }[] = [];
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    if (cancelled > 0) {
      list.push({
        level: 'danger',
        text: `${cancelled} cancelled booking${cancelled > 1 ? 's' : ''} need review`,
        url: '/admin/bookings',
      });
    }
    const nearlyFull = occupancy.filter((o) => o.percent >= 85);
    if (nearlyFull.length > 0) {
      list.push({
        level: 'warning',
        text: `${nearlyFull.length} screen${nearlyFull.length > 1 ? 's' : ''} are nearly full (≥85%)`,
      });
    }
    if (showtimes.length === 0) {
      list.push({
        level: 'info',
        text: 'No shows scheduled yet',
        url: '/admin/shows',
      });
    }
    const lowFill = occupancy.filter((o) => o.percent < 30);
    if (lowFill.length > 0) {
      list.push({
        level: 'info',
        text: `${lowFill.length} show${lowFill.length > 1 ? 's' : ''} have low occupancy (<30%)`,
      });
    }
    if (list.length === 0) {
      list.push({ level: 'info', text: 'All systems operational. No alerts.' });
    }
    return list;
  }, [bookings, occupancy, showtimes]);

  const chartData = useMemo(() => buildChartData(bookings, range), [bookings, range]);
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const chartTotal = chartData.reduce((s, d) => s + d.revenue, 0);

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
        .slice(0, 6),
    [bookings],
  );

  const statusBadge = (status: string) => {
    if (status === 'CONFIRMED') return <Badge variant="success" size="sm">Confirmed</Badge>;
    if (status === 'CANCELLED') return <Badge variant="destructive" size="sm">Cancelled</Badge>;
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Compact Header */}
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
          <Button size="sm" onClick={() => setAddMovieModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Movie
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.positive ? TrendingUp : TrendingDown;
          return (
            <div
              key={stat.key}
              className="p-5 rounded-xl bg-card border border-border space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', stat.iconBg)}>
                  <Icon className={cn('w-4 h-4', stat.iconClass)} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{stat.sub}</p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <TrendIcon className={cn('w-3 h-3', stat.positive ? 'text-emerald-500' : 'text-rose-500')} />
                  {stat.deltaText}
                </span>
                {/* Sparkline */}
                <svg viewBox="0 0 40 18" className="w-16 h-6" aria-hidden="true">
                  <polyline
                    points={stat.spark.map((v, i) => `${(i / (stat.spark.length - 1)) * 38}${14 - (v / 12) * 12}`).join(' ')}
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

      {/* Chart & Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">Box Office Revenue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {range === '7D' ? 'Revenue for the last 7 days' : range === '30D' ? 'Revenue for the last 30 days' : 'Revenue for the last 12 months'}
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

          <div className="flex items-center gap-3">
            <div>
              <p className="text-xl font-bold text-foreground tracking-tight">{formatCurrency(chartTotal)}</p>
              <p className="text-[11px] text-muted-foreground">Total revenue</p>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Y-axis: daily/monthly revenue (USD)
            </div>
          </div>

          {chartData.length === 0 ? (
            <EmptyState title="No revenue data" hint="Add confirmed bookings to see the chart." />
          ) : (
            <div className="relative pt-2">
              {/* Y-axis scale max */}
              <div className="absolute -top-1 left-0 right-0 text-[10px] text-muted-foreground flex justify-between pointer-events-none">
                <span>{formatCurrency(maxRevenue)}</span>
                <span>0</span>
              </div>
              <div className="flex items-end gap-1 h-48 border-b border-border pt-6">
                {chartData.map((d, i) => {
                  const h = Math.round((d.revenue / maxRevenue) * 100);
                  const showValue = d.count > 0;
                  return (
                    <div
                      key={`${d.key}-${i}`}
                      className="flex-1 flex flex-col items-center justify-end gap-1 group h-full min-w-0"
                      title={`${d.label}: ${formatCurrency(d.revenue)}${d.count ? ` (${d.count} booking${d.count > 1 ? 's' : ''})` : ''}`}
                    >
                      {showValue && (
                        <span className="hidden sm:block text-[10px] font-semibold text-foreground">
                          {d.revenue > 0 ? `$${Math.round(d.revenue).toLocaleString()}` : ''}
                        </span>
                      )}
                      <div
                        style={{ height: `${Math.max(h, d.revenue > 0 ? 3 : 1)}%` }}
                        className={cn(
                          'w-full rounded-t-sm transition-all group-hover:opacity-90',
                          d.revenue > 0 ? 'bg-[#E50914]' : 'bg-muted',
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center leading-none pt-1">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Screen Occupancy */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">Screen Occupancy</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Live fill rate by screening</p>
            </div>
            <Armchair className="w-4 h-4 text-muted-foreground" />
          </div>

          {occupancy.length === 0 ? (
            <EmptyState title="No screenings" hint="Screenings will appear here when shows are scheduled." />
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {occupancy.map((o, idx) => {
                const nearFull = o.percent >= 85;
                return (
                  <div
                    key={`${o.hall}-${o.nextTime}-${idx}`}
                    className="space-y-1.5 p-3 rounded-lg bg-muted border border-border"
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
                          nearFull
                            ? 'bg-rose-500'
                            : o.percent >= 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500',
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
            Manage Shows
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Needs Attention + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Attention */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground tracking-tight">Needs Attention</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2.5 p-3 rounded-lg border',
                  a.level === 'danger' && 'bg-rose-500/10 border-rose-500/20',
                  a.level === 'warning' && 'bg-amber-500/10 border-amber-500/20',
                  a.level === 'info' && 'bg-muted border-border',
                )}
              >
                {a.level === 'danger' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                ) : a.level === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground leading-snug">{a.text}</p>
                  {a.url && (
                    <button
                      onClick={() => navigate(a.url!)}
                      className="text-[11px] font-semibold text-[#E50914] hover:underline mt-0.5"
                    >
                      Review now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">Recent Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest bookings</p>
            </div>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="text-xs font-semibold text-[#E50914] hover:underline"
            >
              View all
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <EmptyState title="No recent activity" hint="New bookings will show up here." />
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 pr-3 font-semibold">Booking</th>
                    <th className="py-2.5 pr-3 font-semibold">Customer</th>
                    <th className="py-2.5 pr-3 font-semibold">Movie</th>
                    <th className="py-2.5 pr-3 font-semibold">Amount</th>
                    <th className="py-2.5 pr-3 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-3 font-mono font-semibold text-foreground">{b.id}</td>
                      <td className="py-3 pr-3 font-medium text-foreground">{b.userName}</td>
                      <td className="py-3 pr-3 text-muted-foreground truncate max-w-[160px]">{b.movieTitle}</td>
                      <td className="py-3 pr-3 font-semibold text-emerald-500">{formatCurrency(b.totalAmount)}</td>
                      <td className="py-3 pr-3">{statusBadge(b.status)}</td>
                      <td className="py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(b.bookingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Movie Modal */}
      <Modal
        isOpen={addMovieModalOpen}
        onClose={() => setAddMovieModalOpen(false)}
        maxWidth="xl"
        title="Add New Movie"
      >
        <MovieForm
          onSubmit={(data) => {
            addMovie(data);
            setAddMovieModalOpen(false);
          }}
          onCancel={() => setAddMovieModalOpen(false)}
        />
      </Modal>
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
