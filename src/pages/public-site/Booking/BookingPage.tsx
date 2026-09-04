import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Ticket,
  CheckCircle2,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { formatCurrency, formatDate } from '@/utils/formatDate';

export const BookingPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');
  const navigate = useNavigate();

  const { showtimes, getMovieById, addBooking } = useMovieStore();
  const { user } = useAuthStore();

  const showtime = showtimes.find((st) => st.id === showtimeId) || showtimes[0];
  const movie = getMovieById(movieId || showtime?.movieId || 'm-1');

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'QR_CODE' | 'PAYPAL'>('CREDIT_CARD');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  const getSeatType = (row: string): 'STANDARD' | 'VIP' | 'COUPLE' => {
    if (row === 'H') return 'COUPLE';
    if (row === 'F' || row === 'G') return 'VIP';
    return 'STANDARD';
  };

  const getSeatPrice = (row: string): number => {
    const type = getSeatType(row);
    if (type === 'COUPLE') return (showtime?.vipPrice || 22) + 8;
    if (type === 'VIP') return showtime?.vipPrice || 22;
    return showtime?.price || 15;
  };

  const isSeatOccupied = (seatId: string) => {
    return showtime?.occupiedSeats.includes(seatId) || false;
  };

  const handleSeatClick = (seatId: string) => {
    if (isSeatOccupied(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert('Maximum 8 seats allowed per transaction');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Calculate Total
  const subtotal = selectedSeats.reduce((acc, seatId) => {
    const row = seatId[0];
    return acc + getSeatPrice(row);
  }, 0);
  const serviceFee = selectedSeats.length > 0 ? 2.5 : 0;
  const grandTotal = subtotal + serviceFee;

  const handleConfirmBooking = () => {
    if (selectedSeats.length === 0) return;

    const booking = addBooking({
      userId: user ? String(user.id) : 'u-guest',
      userName: user?.username || 'Guest User',
      userEmail: user?.email || 'guest@example.com',
      movieId: movie?.id || 'm-1',
      movieTitle: movie?.title || 'Unknown Movie',
      moviePoster: movie?.posterUrl || '',
      showtimeId: showtime?.id || 'st-1',
      cinemaName: showtime?.cinemaName || 'Cinematique Grand Hall',
      hallName: showtime?.hallName || 'IMAX Screen 1',
      showDate: showtime?.date || '2026-08-21',
      showTime: showtime?.time || '14:30',
      seats: selectedSeats,
      totalAmount: grandTotal,
      paymentMethod,
      status: 'CONFIRMED',
    });

    setConfirmedBookingId(booking.id);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Link
            to={movie ? `/movies/${movie.id}` : '/'}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Movie
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {movie?.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="text-[#E50914] font-bold">{showtime?.cinemaName}</span>
            <span>•</span>
            <span>{showtime?.hallName}</span>
            <span>•</span>
            <Badge variant="primary" size="sm">
              {showtime?.format}
            </Badge>
            <span>•</span>
            <span className="text-white font-medium">
              {formatDate(showtime?.date || '')} at {showtime?.time}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#27272a] border border-border" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#E50914] shadow-md shadow-[#E50914]/50" />
            <span className="text-white font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-zinc-800 border border-border opacity-40" />
            <span className="text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500" />
            <span className="text-amber-400">VIP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Seat Layout Box */}
        <div className="lg:col-span-2 p-6 sm:p-10 rounded-3xl bg-[#141417] border border-border space-y-10 shadow-2xl">
          {/* Cinema Screen Curve */}
          <div className="space-y-2 text-center max-w-lg mx-auto">
            <div className="screen-curve w-full" />
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              THEATER SCREEN
            </p>
          </div>

          {/* Seat Grid */}
          <div className="space-y-3 overflow-x-auto pb-4 scrollbar-none">
            {rows.map((row) => {
              const seatType = getSeatType(row);
              const price = getSeatPrice(row);

              return (
                <div key={row} className="flex items-center justify-center gap-2 sm:gap-3 min-w-[500px]">
                  {/* Row Letter */}
                  <span className="w-6 text-xs font-bold text-muted-foreground text-center">
                    {row}
                  </span>

                  {/* Seats in Row */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {Array.from({ length: seatsPerRow }, (_, i) => {
                      const seatNum = i + 1;
                      const seatId = `${row}${seatNum}`;
                      const isOccupied = isSeatOccupied(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatClass = 'bg-[#27272a] text-muted-foreground hover:bg-white/20 border border-border';

                      if (isOccupied) {
                        seatClass = 'bg-zinc-900 text-transparent border-transparent opacity-30 cursor-not-allowed';
                      } else if (isSelected) {
                        seatClass = 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/50 scale-110 font-bold border-transparent';
                      } else if (seatType === 'VIP') {
                        seatClass = 'bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30';
                      } else if (seatType === 'COUPLE') {
                        seatClass = 'bg-rose-500/10 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30';
                      }

                      return (
                        <motion.button
                          key={seatId}
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seatId)}
                          whileHover={isOccupied ? {} : { scale: 1.15 }}
                          whileTap={isOccupied ? {} : { scale: 0.85 }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] flex items-center justify-center transition-all ${seatClass}`}
                          title={`${seatId} (${seatType} - ${formatCurrency(price)})`}
                        >
                          {seatNum}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Row Letter right */}
                  <span className="w-6 text-xs font-bold text-muted-foreground text-center">
                    {row}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Seat Category Pricing Helper */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-border text-center">
            <div className="p-3 rounded-xl bg-white/5">
              <span className="text-[11px] text-muted-foreground block font-medium">Standard (Rows A-E)</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(showtime?.price || 15)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[11px] text-amber-300 block font-medium">VIP Lounge (Rows F-G)</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(showtime?.vipPrice || 22)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[11px] text-rose-300 block font-medium">Couple Suite (Row H)</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency((showtime?.vipPrice || 22) + 8)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="p-6 rounded-3xl bg-[#161619] border border-border space-y-6 shadow-2xl sticky top-24">
          <h3 className="text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-border flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#E50914]" />
            Booking Summary
          </h3>

          {/* Selected Seats List */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Selected Seats</span>
            {selectedSeats.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seatId) => (
                  <span
                    key={seatId}
                    className="px-2.5 py-1 rounded-md bg-[#E50914] text-white text-xs font-bold shadow-sm"
                  >
                    {seatId} ({formatCurrency(getSeatPrice(seatId[0]))})
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No seats selected yet.</p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium block">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CREDIT_CARD', name: 'Card', icon: CreditCard },
                { id: 'QR_CODE', name: 'QR Pay', icon: QrCode },
                { id: 'PAYPAL', name: 'PayPal', icon: ShieldCheck },
              ].map((pm) => {
                const Icon = pm.icon;
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as 'CREDIT_CARD' | 'QR_CODE' | 'PAYPAL')}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'border-[#E50914] bg-[#E50914]/10 text-white'
                        : 'border-border bg-white/5 text-muted-foreground hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{pm.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-4 border-t border-border text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tickets ({selectedSeats.length})</span>
              <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Online Convenience Fee</span>
              <span className="text-white font-semibold">{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
              <span className="font-bold text-white">Total Amount</span>
              <span className="text-xl font-black text-[#E50914]">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            disabled={selectedSeats.length === 0}
            onClick={handleConfirmBooking}
            className="w-full py-3.5 px-4 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30"
          >
            Confirm & Pay {selectedSeats.length > 0 && `(${formatCurrency(grandTotal)})`}
          </button>
        </div>
      </div>

      {/* Booking Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate('/history');
        }}
        maxWidth="md"
        title="Booking Confirmed!"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-white">{movie?.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Booking Ref: <span className="text-[#E50914] font-bold">{confirmedBookingId}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-border text-xs text-left space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Cinema & Hall:</span>
              <span className="font-semibold text-white">{showtime?.cinemaName} - {showtime?.hallName}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Date & Time:</span>
              <span className="font-semibold text-white">{formatDate(showtime?.date || '')} @ {showtime?.time}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Seats:</span>
              <span className="font-bold text-[#E50914]">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between text-muted-foreground border-t border-border pt-2 font-bold">
              <span>Total Paid:</span>
              <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              navigate('/history');
            }}
            className="w-full py-3 rounded-xl bg-[#E50914] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E50914]/30"
          >
            View My Tickets
          </button>
        </div>
      </Modal>
    </div>
  );
};
