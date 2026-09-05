import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  DollarSign,
  Ticket,
  Film,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { MovieForm } from '@/components/forms/MovieForm/MovieForm';
import { formatCurrency } from '@/utils/formatDate';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, bookings, addMovie } = useMovieStore();
  const [addMovieModalOpen, setAddMovieModalOpen] = useState(false);

  // Compute live metrics
  const totalRevenue = bookings.reduce((sum, b) => (b.status === 'CONFIRMED' ? sum + b.totalAmount : sum), 0) + 14500;
  const totalBookingsCount = bookings.length + 380;
  const activeMoviesCount = movies.filter((m) => m.status === 'NOW_SHOWING').length;

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      change: '+18.4%',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Bookings',
      value: totalBookingsCount.toString(),
      change: '+12.6%',
      icon: Ticket,
      color: 'text-[#E50914]',
      bg: 'bg-[#E50914]/10 border-[#E50914]/20',
    },
    {
      title: 'Active Movies',
      value: `${activeMoviesCount} / ${movies.length}`,
      change: 'Catalog',
      icon: Film,
      color: 'text-amber-400',    
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Total Customers',
      value: '1,248',
      change: '+8.2%',
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  // Chart data for weekly bookings
  const salesChartData = [
    { day: 'Mon', revenue: 1400, bookings: 42 },
    { day: 'Tue', revenue: 1800, bookings: 55 },
    { day: 'Wed', revenue: 2100, bookings: 68 },
    { day: 'Thu', revenue: 1950, bookings: 60 },
    { day: 'Fri', revenue: 3800, bookings: 120 },
    { day: 'Sat', revenue: 4900, bookings: 165 },
    { day: 'Sun', revenue: 4200, bookings: 140 },
  ];

  const maxRevenue = Math.max(...salesChartData.map((d) => d.revenue));

  return (
    <div className="space-y-8">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#E50914] via-[#c90a14] to-[#8c0710] text-white border border-border shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white/90" />
            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
              Control Center
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Welcome to Cinematique Admin Console
          </h2>
          <p className="text-xs text-white/80">
            Real-time box office statistics, movie schedules, and booking logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddMovieModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#E50914] hover:bg-white/90 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-black/20"
          >
            <Plus className="w-4 h-4" />
            Add Movie
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {stat.value}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Chart & Live Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue & Bookings Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border space-y-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Weekly Box Office Performance
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ticket sales breakdown for the last 7 days
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> +24% vs last week
            </span>
          </div>

          {/* SVG/CSS Interactive Bar Chart */}
          <div className="pt-4">
            <div className="flex items-end justify-between gap-2 h-52 pt-6 border-b border-border">
              {salesChartData.map((data) => {
                const heightPercent = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white bg-black/90 px-2 py-1 rounded shadow pointer-events-none mb-1">
                      {formatCurrency(data.revenue)}
                    </div>
                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="w-full max-w-[36px] bg-gradient-to-t from-[#E50914]/60 to-[#E50914] rounded-t-lg group-hover:brightness-125 transition-all shadow-md shadow-[#E50914]/20"
                    />
                    {/* Day label */}
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popular / Active Cinema Halls */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">
              Screen Occupancy
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Real-time theater capacity & fill rate
            </p>

            <div className="space-y-4">
              {[
                { name: 'IMAX Theater 1', movie: 'The Batman', fill: 88, format: 'IMAX' },
                { name: 'Dolby Atmos 2', movie: 'Oppenheimer', fill: 74, format: '2D' },
                { name: 'VIP Lounge 3', movie: 'Avatar 2', fill: 95, format: '3D' },
                { name: '4DX Theater 4', movie: 'Dune 2', fill: 62, format: '4DX' },
              ].map((hall) => (
                <div key={hall.name} className="space-y-1.5 p-3 rounded-xl bg-muted border border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{hall.name}</span>
                    <span className="text-emerald-400 font-bold">{hall.fill}% Full</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{hall.movie}</span>
                    <Badge variant="primary" size="sm">{hall.format}</Badge>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${hall.fill}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-[#E50914] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/movies')}
            className="w-full py-2.5 rounded-xl bg-secondary hover:bg-muted text-secondary-foreground text-xs font-bold uppercase tracking-wider transition-colors text-center"
          >
            Manage All Movies
          </button>
        </div>
      </div>

      {/* Recent Bookings Live Table */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Recent Transactions & Bookings
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live updates of customer ticket reservations
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="text-xs text-[#E50914] font-bold hover:underline"
          >
            View All Bookings
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Ref ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Movie</th>
                <th className="pb-3 font-semibold">Seats</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-foreground">
                    {booking.id}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-foreground">{booking.userName}</div>
                    <div className="text-[10px] text-muted-foreground">{booking.userEmail}</div>
                  </td>
                  <td className="py-3 font-medium text-foreground">
                    {booking.movieTitle}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-[11px]">
                      {booking.seats.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    {formatCurrency(booking.totalAmount)}
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED'
                          ? 'success'
                          : booking.status === 'CANCELLED'
                          ? 'destructive'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {booking.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
