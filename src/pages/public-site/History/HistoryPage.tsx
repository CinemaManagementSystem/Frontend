import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, XCircle } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { formatCurrency, formatDate } from '@/utils/formatDate';

type TicketTab = 'upcoming' | 'history';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

function isUpcoming(showDate: string, showTime: string) {
  const timestamp = Date.parse(`${showDate}T${showTime || '00:00'}:00`);
  return Number.isNaN(timestamp) || timestamp >= Date.now();
}

export const HistoryPage: FC = () => {
  const { bookings, cancelBooking, fetchBookings } = useMovieStore();
  const [activeTab, setActiveTab] = useState<TicketTab>('upcoming');

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  const upcoming = useMemo(() => bookings.filter((booking) => booking.status !== 'CANCELLED' && isUpcoming(booking.showDate, booking.showTime)), [bookings]);
  const history = useMemo(() => bookings.filter((booking) => !upcoming.includes(booking)), [bookings, upcoming]);
  const visibleBookings = activeTab === 'upcoming' ? upcoming : history;

  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_50%_36%,rgba(65,0,10,.58),transparent_58%),linear-gradient(180deg,#050506_0%,#170207_56%,#050506_100%)] px-4 pb-16 pt-7 text-white sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-center border-b border-white/10"><div className="flex items-center gap-7"><button type="button" onClick={() => setActiveTab('upcoming')} aria-selected={activeTab === 'upcoming'} className={`relative pb-4 text-lg font-bold transition ${activeTab === 'upcoming' ? 'text-white' : 'text-white/55 hover:text-white'} ${FOCUS}`}>Upcoming{activeTab === 'upcoming' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-red-500" />}</button><button type="button" onClick={() => setActiveTab('history')} aria-selected={activeTab === 'history'} className={`relative pb-4 text-lg font-bold transition ${activeTab === 'history' ? 'text-white' : 'text-white/55 hover:text-white'} ${FOCUS}`}>History{activeTab === 'history' && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-red-500" />}</button></div></div>

        {visibleBookings.length === 0 ? (
          <section className="flex min-h-[58vh] flex-col items-center justify-center text-center">
            <div className="relative mb-6 h-24 w-28 rotate-[-9deg] text-red-100"><Ticket className="absolute left-3 top-3 h-16 w-24 drop-shadow-[0_0_12px_rgba(229,9,20,.35)]" strokeWidth={1.1} /><span className="absolute left-1 top-12 h-px w-24 rotate-[-18deg] bg-red-400/70" /></div>
            <h1 className="text-xl font-black sm:text-2xl">{activeTab === 'upcoming' ? 'No Upcoming Tickets' : 'No Ticket History'}</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">{activeTab === 'upcoming' ? 'Your upcoming movie tickets will appear here after you complete a booking.' : 'Completed and past movie bookings will appear here.'}</p>
            <Link to="/cinemas" className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold hover:bg-red-500 ${FOCUS}`}>Browse showtimes <Ticket className="h-4 w-4" /></Link>
          </section>
        ) : (
          <section className="mx-auto max-w-4xl space-y-5 pt-8">
            {visibleBookings.map((booking) => {
              const isCancelled = booking.status === 'CANCELLED';
              return <article key={booking.id} className={`overflow-hidden rounded-2xl border border-white/15 bg-[#171013] shadow-xl shadow-black/25 ${isCancelled ? 'opacity-60' : ''}`}><div className="grid md:grid-cols-[180px_1fr_160px]"><div className="relative min-h-48 bg-black"><img src={booking.moviePoster} alt={booking.movieTitle} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /></div><div className="space-y-4 p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-400">E-ticket #{booking.id}</p><h2 className="mt-1 text-xl font-black">{booking.movieTitle}</h2></div><span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase text-white/70">{booking.status}</span></div><div className="grid gap-2 text-xs text-white/60 sm:grid-cols-2"><span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-red-400" />{formatDate(booking.showDate)}</span><span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-red-400" />{booking.showTime}</span><span className="flex items-center gap-2 sm:col-span-2"><MapPin className="h-3.5 w-3.5 text-red-400" />{booking.cinemaName} · {booking.hallName}</span></div><div className="flex items-end justify-between border-t border-white/10 pt-3 text-xs"><span><span className="block text-white/45">Seats</span><strong>{booking.seats.join(', ') || '—'}</strong></span><span className="text-right"><span className="block text-white/45">Total</span><strong className="text-emerald-400">{formatCurrency(booking.totalAmount)}</strong></span></div></div><div className="flex flex-col items-center justify-center gap-3 border-t border-dashed border-white/15 bg-black/20 p-5 md:border-l md:border-t-0"><div className="rounded-lg bg-white p-2"><img src={booking.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CINEMATIQUE'} alt="Ticket QR code" className="h-20 w-20" /></div><span className="text-[10px] uppercase tracking-wider text-white/45">Scan at entrance</span>{!isCancelled && <button type="button" onClick={() => void cancelBooking(booking.id)} className={`inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 ${FOCUS}`}><XCircle className="h-3 w-3" />Cancel ticket</button>}</div></div></article>;
            })}
          </section>
        )}
      </div>
    </main>
  );
};
