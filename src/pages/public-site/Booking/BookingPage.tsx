import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Copy,
  Download,
  Home,
  LoaderCircle,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  Star,
  Ticket,
  Utensils,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatCurrency, formatDate } from '@/utils/formatDate';
import { bookingAdminService } from '@/services/bookingAdminService';
import { getApiErrorMessage } from '@/services/apiClient';
import { paymentService } from '@/services/paymentService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import { resolvePaymentQrDisplay, type PaymentQrDisplay } from '@/lib/paymentQr';
import type { Payment as ApiPayment } from '@/types/payment';
import type { PaymentTransaction } from '@/types/paymentTransaction';
import { SnackImage } from './SnackImage';

type BookingStep = 'seats' | 'snacks' | 'review' | 'payment' | 'qr-payment' | 'success' | 'ticket';
type BookingPaymentMethod = 'CREDIT_CARD' | 'QR_CODE';

interface CheckoutPayment {
  payment: ApiPayment;
  transactions: PaymentTransaction[];
  display: PaymentQrDisplay;
}

interface SnackItem {
  id: string;
  name: string;
  category: 'Popcorn' | 'Drink' | 'Combo' | 'Snacks';
  price: number;
  imageUrl: string;
}

const FLOW_STEPS: { id: BookingStep | 'movie' | 'showtime'; number: number; label: string; description: string }[] = [
  { id: 'movie', number: 1, label: 'Browse Movies', description: 'Explore now playing and coming soon' },
  { id: 'showtime', number: 2, label: 'Choose Date & Showtime', description: 'Select your preferred date and time' },
  { id: 'seats', number: 3, label: 'Select Your Seats', description: 'Choose available seats on the seat map' },
  { id: 'snacks', number: 4, label: 'Add Snacks & Drinks', description: 'Optional cinema treats' },
  { id: 'review', number: 5, label: 'Review Your Order', description: 'Check your order details' },
  { id: 'payment', number: 6, label: 'Select Payment Method', description: 'Choose how you want to pay' },
  { id: 'qr-payment', number: 7, label: 'Complete Payment', description: 'Follow the payment instructions' },
  { id: 'success', number: 8, label: 'Booking Success', description: 'Your booking is confirmed' },
  { id: 'ticket', number: 9, label: 'Your E-Ticket', description: 'View and use your ticket' },
];

const SNACKS: SnackItem[] = [
  { id: 'classic-popcorn', name: 'Classic Popcorn', category: 'Popcorn', price: 4, imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=500&q=80' },
  { id: 'caramel-popcorn', name: 'Caramel Popcorn', category: 'Popcorn', price: 5, imageUrl: 'https://images.unsplash.com/photo-1625848198401-6f2b5a1a5f9f?auto=format&fit=crop&w=500&q=80' },
  { id: 'large-soda', name: 'Large Soda', category: 'Drink', price: 3, imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=500&q=80' },
  { id: 'nachos', name: 'Nachos', category: 'Snacks', price: 4.5, imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80' },
  { id: 'chocolate', name: 'Chocolate', category: 'Snacks', price: 3.5, imageUrl: 'https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=500&q=80' },
  { id: 'combo-set', name: 'Combo Set', category: 'Combo', price: 8, imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?auto=format&fit=crop&w=500&q=80' },
];

const SNACK_CATEGORIES = ['All', 'Popcorn', 'Drink', 'Combo', 'Snacks'] as const;

const PAYMENT_METHODS: { id: BookingPaymentMethod; name: string; description: string; icon: typeof CreditCard }[] = [
  { id: 'CREDIT_CARD', name: 'Credit / Debit Card', description: 'Visa, Mastercard, JCB', icon: CreditCard },
  { id: 'QR_CODE', name: 'QR Pay', description: 'Scan with your banking app', icon: QrCode },
];

function parsePositiveId(value: string | null | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseDemoShowId(value: string | null | undefined): number | null {
  if (!value) return null;
  const direct = parsePositiveId(value);
  if (direct) return direct;
  const match = value.match(/^st-(\d+)$/i);
  return match ? parsePositiveId(match[1]) : null;
}

export const BookingPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');
  const navigate = useNavigate();
  const { showtimes, getMovieById, addBooking } = useMovieStore();
  const { user } = useAuthStore();

  const showtime = showtimes.find((show) => show.id === showtimeId) || showtimes[0];
  const movie = getMovieById(movieId || showtime?.movieId || 'm-1');
  const [step, setStep] = useState<BookingStep>('seats');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [snackCategory, setSnackCategory] = useState<(typeof SNACK_CATEGORIES)[number]>('All');
  const [snackQuantities, setSnackQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('QR_CODE');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [backendBookingId, setBackendBookingId] = useState<number | null>(() => parsePositiveId(searchParams.get('bookingId')));
  const [checkoutPayment, setCheckoutPayment] = useState<CheckoutPayment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const backendOrderId = parsePositiveId(searchParams.get('orderId'));

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;
  const currentStepNumber = FLOW_STEPS.find((flowStep) => flowStep.id === step)?.number ?? 2;

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

  const isSeatOccupied = (seatId: string) => showtime?.occupiedSeats.includes(seatId) || false;

  const filteredSnacks = useMemo(
    () => SNACKS.filter((snack) => snackCategory === 'All' || snack.category === snackCategory),
    [snackCategory],
  );

  const selectedSnackItems = useMemo(
    () => SNACKS.filter((snack) => (snackQuantities[snack.id] ?? 0) > 0),
    [snackQuantities],
  );

  const ticketSubtotal = selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId[0]), 0);
  const snacksSubtotal = selectedSnackItems.reduce(
    (total, snack) => total + snack.price * (snackQuantities[snack.id] ?? 0),
    0,
  );
  const serviceFee = selectedSeats.length > 0 ? 2.5 : 0;
  const grandTotal = ticketSubtotal + snacksSubtotal + serviceFee;

  const updateSnackQuantity = (snackId: string, change: number) => {
    setSnackQuantities((current) => ({
      ...current,
      [snackId]: Math.max(0, (current[snackId] ?? 0) + change),
    }));
  };

  const handleSeatClick = (seatId: string) => {
    if (isSeatOccupied(seatId)) return;
    setSelectedSeats((current) => {
      if (current.includes(seatId)) return current.filter((seat) => seat !== seatId);
      if (current.length >= 8) return current;
      return [...current, seatId];
    });
  };

  const goToStep = (nextStep: BookingStep) => {
    if (['snacks', 'review', 'payment'].includes(nextStep) && selectedSeats.length === 0) return;
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ensureBackendBookingId = async (): Promise<number | null> => {
    if (backendBookingId) return backendBookingId;
    if (backendOrderId) return null;
    if (!user) throw new Error('Please sign in before creating a payment.');

    const showId = parseDemoShowId(showtimeId) ?? parseDemoShowId(showtime?.id);
    if (!showId) {
      throw new Error('This showtime does not have a backend show id yet. Open booking from a backend showtime or pass bookingId/orderId in the URL.');
    }

    const booking = await bookingAdminService.create({
      bookingCode: `BK-${Date.now()}`,
      bookedAt: new Date().toISOString().slice(0, 19),
      status: 'PENDING',
      totalAmount: Number(grandTotal.toFixed(2)),
      customerId: user.id,
      showId,
    });

    setBackendBookingId(booking.id);
    setConfirmedBookingId(booking.bookingCode);
    return booking.id;
  };

  const startBackendPayment = async () => {
    if (paymentLoading) return;
    setPaymentError('');

    if (paymentMethod !== 'QR_CODE') {
      goToStep('qr-payment');
      return;
    }

    try {
      setPaymentLoading(true);
      if (!user) throw new Error('Please sign in before creating a KHQR payment.');

      const bookingId = await ensureBackendBookingId();
      const payment = await paymentService.create({
        amount: Number(grandTotal.toFixed(2)),
        paymentMethod: 'KHQR',
        customerId: user.id,
        bookingId,
        orderId: backendOrderId,
      });
      const transactions = await paymentTransactionService.listByPayment(payment.id).catch(() => []);
      const display = resolvePaymentQrDisplay(payment, transactions);

      if (!display) throw new Error('The payment API did not return QR data for this KHQR payment.');

      setCheckoutPayment({ payment, transactions, display });
      setStep('qr-payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setPaymentError(getApiErrorMessage(error, 'payment'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setPaymentError('');

    if (paymentMethod === 'QR_CODE' && checkoutPayment) {
      try {
        setPaymentLoading(true);
        const payment = await paymentService.checkStatus(checkoutPayment.payment.id);
        const transactions = await paymentTransactionService.listByPayment(payment.id).catch(() => checkoutPayment.transactions);
        const display = resolvePaymentQrDisplay(payment, transactions) ?? checkoutPayment.display;
        setCheckoutPayment({ payment, transactions, display });

        if (payment.status !== 'PAID') {
          setPaymentError('Payment is still pending. Scan the QR code and wait for the backend payment status to become PAID.');
          return;
        }
      } catch (error) {
        setPaymentError(getApiErrorMessage(error, 'payment status'));
        return;
      } finally {
        setPaymentLoading(false);
      }
    }

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
    setConfirmedBookingId(confirmedBookingId || booking.id);
    setStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paymentReference = checkoutPayment?.display.reference || confirmedBookingId || `CIN-${(showtime?.date || '20260821').replace(/-/g, '')}-001234`;
  const paymentQrUrl = checkoutPayment?.display.qrImageSrc || `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(`${paymentReference}|${grandTotal.toFixed(2)}|${movie?.title || 'Cinematique'}`)}`;

  const downloadTicket = () => {
    const ticketText = [
      'CINEMATIQUE E-TICKET',
      `Booking Reference: ${confirmedBookingId}`,
      `Movie: ${movie?.title || 'Unknown Movie'}`,
      `Showtime: ${showtime?.cinemaName} - ${showtime?.hallName}`,
      `Date: ${formatDate(showtime?.date || '')} at ${showtime?.time}`,
      `Seats: ${selectedSeats.join(', ')}`,
      `Total: ${formatCurrency(grandTotal)}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([ticketText], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${confirmedBookingId || 'cinematique-ticket'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderStepHeader = () => (
    <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
      <div className="flex min-w-[720px] items-start justify-between gap-2">
        {FLOW_STEPS.map((flowStep, index) => {
          const isActive = flowStep.number === currentStepNumber;
          const isComplete = flowStep.number < currentStepNumber;
          const isMovieStep = flowStep.id === 'movie' || flowStep.id === 'showtime';
          return (
            <React.Fragment key={flowStep.id}>
              <button
                type="button"
                onClick={() => {
                  if (isMovieStep) navigate(movie ? `/movies/${movie.id}` : '/movies');
                  else if (isComplete && flowStep.id !== 'success' && flowStep.id !== 'ticket' && flowStep.id !== 'movie' && flowStep.id !== 'showtime') goToStep(flowStep.id);
                }}
                disabled={!isMovieStep && !isComplete && !isActive}
                className="group flex min-w-[104px] flex-col items-center gap-2 text-center disabled:cursor-default"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all ${isActive || isComplete ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30' : 'border border-border bg-muted text-muted-foreground'} ${isMovieStep && !isActive ? 'group-hover:ring-2 group-hover:ring-[#E50914]/30' : ''}`}>
                  {isComplete ? <Check className="h-5 w-5" /> : flowStep.number}
                </span>
                <span className={`text-[11px] font-bold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{flowStep.label}</span>
                <span className="text-[10px] text-muted-foreground">{flowStep.description}</span>
              </button>
              {index < FLOW_STEPS.length - 1 && <div className={`mt-5 h-px flex-1 ${isComplete ? 'bg-[#E50914]' : 'bg-border'}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderMovieSummary = () => (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 p-3">
      <img src={movie?.posterUrl} alt={movie?.title || 'Movie poster'} className="h-20 w-14 rounded-lg object-cover" />
      <div className="min-w-0 space-y-1">
        <h2 className="truncate text-sm font-black uppercase text-foreground">{movie?.title}</h2>
        <p className="text-[11px] font-semibold text-[#E50914]">{showtime?.cinemaName || 'Cinematique Grand Hall'}</p>
        <p className="text-[11px] text-muted-foreground">{showtime?.hallName || 'IMAX Theater 1'} · {formatDate(showtime?.date || '')} at {showtime?.time || '14:30'}</p>
      </div>
    </div>
  );

  const renderSeatSelection = () => (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8">
        <div className="mx-auto mb-8 max-w-lg space-y-2 text-center"><div className="screen-curve w-full" /><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">THEATER SCREEN</p></div>
        <div className="space-y-3 overflow-x-auto pb-4 scrollbar-none">
          {rows.map((row) => {
            const seatType = getSeatType(row);
            const price = getSeatPrice(row);
            return (
              <div key={row} className="flex min-w-[500px] items-center justify-center gap-2 sm:gap-3">
                <span className="w-6 text-center text-xs font-bold text-muted-foreground">{row}</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {Array.from({ length: seatsPerRow }, (_, index) => {
                    const seatId = `${row}${index + 1}`;
                    const occupied = isSeatOccupied(seatId);
                    const selected = selectedSeats.includes(seatId);
                    let seatClass = 'border border-border bg-muted text-muted-foreground hover:bg-secondary';
                    if (occupied) seatClass = 'cursor-not-allowed border-transparent bg-zinc-900 text-transparent opacity-30';
                    else if (selected) seatClass = 'scale-110 border-transparent bg-[#E50914] font-bold text-white shadow-lg shadow-[#E50914]/50';
                    else if (seatType === 'VIP') seatClass = 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/30';
                    else if (seatType === 'COUPLE') seatClass = 'border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/30';
                    return (
                      <motion.button key={seatId} type="button" disabled={occupied} onClick={() => handleSeatClick(seatId)} whileHover={occupied ? {} : { scale: 1.12 }} whileTap={occupied ? {} : { scale: 0.9 }} className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${seatClass}`} title={`${seatId} (${seatType} - ${formatCurrency(price)})`} aria-label={`${seatId}, ${occupied ? 'occupied' : selected ? 'selected' : 'available'}`}>
                        {index + 1}
                      </motion.button>
                    );
                  })}
                </div>
                <span className="w-6 text-center text-xs font-bold text-muted-foreground">{row}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 grid gap-3 border-t border-border pt-6 text-center sm:grid-cols-3">
          <div className="rounded-xl bg-muted p-3"><span className="block text-[11px] font-medium text-muted-foreground">Standard · Rows A-E</span><span className="text-sm font-bold text-foreground">{formatCurrency(showtime?.price || 15)}</span></div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3"><span className="block text-[11px] font-medium text-amber-300">VIP Lounge · Rows F-G</span><span className="text-sm font-bold text-foreground">{formatCurrency(showtime?.vipPrice || 22)}</span></div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3"><span className="block text-[11px] font-medium text-rose-300">Couple Suite · Row H</span><span className="text-sm font-bold text-foreground">{formatCurrency((showtime?.vipPrice || 22) + 8)}</span></div>
        </div>
      </div>
      <aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl lg:sticky lg:top-24">
        <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-black uppercase tracking-wider text-foreground"><Ticket className="h-4 w-4 text-[#E50914]" /> Booking Summary</h2>
        {renderMovieSummary()}
        <div className="space-y-2 border-t border-border pt-4"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Selected Seats</span><span className="font-bold text-foreground">{selectedSeats.length} / 8</span></div>{selectedSeats.length > 0 ? <div className="flex flex-wrap gap-2">{selectedSeats.map((seatId) => <span key={seatId} className="rounded-md bg-[#E50914] px-2.5 py-1 text-xs font-bold text-white">{seatId}</span>)}</div> : <p className="text-xs italic text-muted-foreground">No seats selected yet.</p>}</div>
        <div className="space-y-2 border-t border-border pt-4 text-xs"><div className="flex justify-between text-muted-foreground"><span>Tickets</span><span className="font-semibold text-foreground">{formatCurrency(ticketSubtotal)}</span></div><div className="flex justify-between text-muted-foreground"><span>Convenience Fee</span><span className="font-semibold text-foreground">{formatCurrency(serviceFee)}</span></div><div className="flex justify-between border-t border-border pt-3 text-sm font-bold"><span>Total</span><span className="text-[#E50914]">{formatCurrency(ticketSubtotal + serviceFee)}</span></div></div>
        <button type="button" disabled={selectedSeats.length === 0} onClick={() => goToStep('snacks')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-50">Continue to Snacks <ArrowRight className="h-4 w-4" /></button>
      </aside>
    </div>
  );

  const renderSnackSelection = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">{SNACK_CATEGORIES.map((category) => <button key={category} type="button" onClick={() => setSnackCategory(category)} className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all ${snackCategory === category ? 'border-[#E50914] bg-[#E50914] text-white' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>{category}</button>)}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filteredSnacks.map((snack) => {
          const quantity = snackQuantities[snack.id] ?? 0;
          return <article key={snack.id} className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-[#E50914]/40"><div className="aspect-[1.15] overflow-hidden bg-muted"><SnackImage name={snack.name} category={snack.category} src={snack.imageUrl} /></div><div className="space-y-3 p-3"><div><h3 className="text-xs font-bold text-foreground">{snack.name}</h3><p className="mt-1 text-xs font-bold text-[#E50914]">{formatCurrency(snack.price)}</p></div><div className="flex items-center justify-between rounded-lg border border-border bg-muted p-1"><button type="button" onClick={() => updateSnackQuantity(snack.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={`Remove one ${snack.name}`}><Minus className="h-3.5 w-3.5" /></button><span className="text-xs font-bold text-foreground">{quantity}</span><button type="button" onClick={() => updateSnackQuantity(snack.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={`Add one ${snack.name}`}><Plus className="h-3.5 w-3.5" /></button></div></div></article>;
        })}
      </div>
      <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row"><button type="button" onClick={() => goToStep('seats')} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</button><button type="button" onClick={() => goToStep('review')} className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#ff1f2d]">Continue to Review <ArrowRight className="h-4 w-4" /></button></div>
    </div>
  );

  const renderOrderLines = () => <div className="space-y-3"><div className="flex items-center justify-between border-b border-border pb-3"><span className="text-xs font-bold text-foreground">Tickets ({selectedSeats.length})</span><span className="text-xs font-bold text-foreground">{formatCurrency(ticketSubtotal)}</span></div>{selectedSeats.map((seatId) => <div key={seatId} className="flex items-center justify-between text-xs text-muted-foreground"><span>Seat {seatId} · {getSeatType(seatId[0])}</span><span>{formatCurrency(getSeatPrice(seatId[0]))}</span></div>)}{selectedSnackItems.length > 0 && <div className="border-t border-border pt-3"><div className="mb-2 flex items-center justify-between text-xs font-bold text-foreground"><span>Snacks & Drinks</span><span>{formatCurrency(snacksSubtotal)}</span></div>{selectedSnackItems.map((snack) => <div key={snack.id} className="flex items-center justify-between text-xs text-muted-foreground"><span>{snack.name} × {snackQuantities[snack.id]}</span><span>{formatCurrency(snack.price * snackQuantities[snack.id])}</span></div>)}</div>}</div>;

  const renderTotals = () => <div className="space-y-3 border-t border-border pt-4 text-xs"><div className="flex justify-between text-muted-foreground"><span>Tickets</span><span>{formatCurrency(ticketSubtotal)}</span></div><div className="flex justify-between text-muted-foreground"><span>Snacks</span><span>{formatCurrency(snacksSubtotal)}</span></div><div className="flex justify-between text-muted-foreground"><span>Convenience Fee</span><span>{formatCurrency(serviceFee)}</span></div><div className="flex justify-between border-t border-border pt-3 text-base font-black text-foreground"><span>Total Amount</span><span className="text-[#E50914]">{formatCurrency(grandTotal)}</span></div></div>;

  const renderReview = () => <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8"><div className="flex items-center gap-2 border-b border-border pb-4"><ClipboardCheck className="h-5 w-5 text-[#E50914]" /><h2 className="text-lg font-black uppercase text-foreground">Review Your Order</h2></div>{renderMovieSummary()}<div className="rounded-xl border border-border bg-muted/40 p-4">{renderOrderLines()}</div>{selectedSnackItems.length === 0 && <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground"><ShoppingBag className="h-4 w-4" /> No snacks added. You can continue without snacks.</div>}</div><aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl lg:sticky lg:top-24"><h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground"><Ticket className="h-4 w-4 text-[#E50914]" /> Order Summary</h2>{renderTotals()}<button type="button" onClick={() => goToStep('payment')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#ff1f2d]">Proceed to Payment <ArrowRight className="h-4 w-4" /></button></aside></div>;

  const renderPayment = () => <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8"><div className="flex items-center gap-2 border-b border-border pb-4"><CreditCard className="h-5 w-5 text-[#E50914]" /><div><h2 className="text-lg font-black uppercase text-foreground">Payment Method</h2><p className="text-xs text-muted-foreground">Choose how you want to pay</p></div></div><div className="space-y-3">{PAYMENT_METHODS.map((method) => { const Icon = method.icon; const active = paymentMethod === method.id; return <button key={method.id} type="button" onClick={() => { setPaymentMethod(method.id); setPaymentError(''); }} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${active ? 'border-[#E50914] bg-[#E50914]/10 shadow-lg shadow-[#E50914]/10' : 'border-border bg-muted/50 hover:bg-muted'}`}><div className={`flex h-11 w-11 items-center justify-center rounded-lg ${active ? 'bg-[#E50914] text-white' : 'bg-secondary text-muted-foreground'}`}><Icon className="h-5 w-5" /></div><div className="flex-1"><p className="text-sm font-bold text-foreground">{method.name}</p><p className="mt-1 text-xs text-muted-foreground">{method.description}</p></div><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-[#E50914] bg-[#E50914]' : 'border-muted-foreground/50'}`}>{active && <Check className="h-3 w-3 text-white" />}</span></button>; })}</div>{paymentError && <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{paymentError}</span></div>}<div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" /> Secure checkout. Your payment details are protected.</div></div><aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl lg:sticky lg:top-24"><h2 className="text-sm font-black uppercase tracking-wider text-foreground">Total Amount</h2>{renderMovieSummary()}{renderTotals()}<button type="button" disabled={paymentLoading} onClick={() => void startBackendPayment()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-[#E50914]/20 transition-all hover:bg-[#ff1f2d] hover:shadow-[#E50914]/40 disabled:cursor-not-allowed disabled:opacity-60">{paymentLoading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Generating KHQR</> : <>Continue to Payment <span className="ml-1">{formatCurrency(grandTotal)}</span></>}</button><p className="text-center text-[10px] text-muted-foreground">By proceeding, you agree to our Terms & Conditions and Privacy Policy.</p></aside></div>;

  const renderQrPayment = () => <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5 rounded-2xl border border-border bg-card p-5 text-center shadow-2xl sm:p-8"><div className="flex items-center gap-2 border-b border-border pb-4 text-left"><QrCode className="h-5 w-5 text-[#E50914]" /><div><h2 className="text-lg font-black uppercase text-foreground">{paymentMethod === 'QR_CODE' ? 'KHQR Payment' : 'Complete Payment'}</h2><p className="text-xs text-muted-foreground">Follow the payment instructions to finish your order</p></div></div>{paymentMethod === 'QR_CODE' ? <><div className="mx-auto mt-3 w-fit rounded-2xl bg-white p-4 shadow-xl"><img src={paymentQrUrl} alt="KHQR payment code" className="h-56 w-56" /></div><p className="text-sm font-semibold text-foreground">Scan this QR code with your banking app</p><p className="text-xs text-muted-foreground">ABA, ACLEDA, Wing, Bakong, and other supported apps</p>{checkoutPayment && checkoutPayment.display.qrPayload === checkoutPayment.payment.transactionId && <p className="mx-auto max-w-md rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">Backend did not return a KHQR payload, so this QR uses the payment transaction reference.</p>}</> : <div className="rounded-xl border border-border bg-muted/50 p-8"><CreditCard className="mx-auto h-10 w-10 text-[#E50914]" /><p className="mt-3 text-sm font-bold text-foreground">Your card payment is ready</p><p className="mt-1 text-xs text-muted-foreground">Complete the payment below to confirm your booking.</p></div>}{paymentError && <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs text-rose-700 dark:text-rose-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{paymentError}</span></div>}<div className="grid gap-3 text-left sm:grid-cols-2"><div className="rounded-xl border border-border bg-muted/50 p-3"><p className="text-[11px] text-muted-foreground">Amount</p><p className="mt-1 text-lg font-black text-foreground">{formatCurrency(grandTotal)}</p></div><div className="rounded-xl border border-border bg-muted/50 p-3"><p className="text-[11px] text-muted-foreground">Reference</p><p className="mt-1 truncate font-mono text-sm font-bold text-foreground">{paymentReference}</p></div></div>{checkoutPayment && <div className="grid gap-3 text-left sm:grid-cols-2"><div className="rounded-xl border border-border bg-muted/50 p-3"><p className="text-[11px] text-muted-foreground">Payment ID</p><p className="mt-1 font-mono text-sm font-bold text-foreground">#{checkoutPayment.payment.id}</p></div><div className="rounded-xl border border-border bg-muted/50 p-3"><p className="text-[11px] text-muted-foreground">Status</p><p className="mt-1 text-sm font-bold text-foreground">{checkoutPayment.payment.status}</p></div></div>}<div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-left text-xs text-blue-700 dark:text-blue-200">Payment will be confirmed after the backend reports PAID. Your reservation is held for 15 minutes.</div></div><aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl lg:sticky lg:top-24"><h2 className="text-sm font-black uppercase tracking-wider text-foreground">Order Summary</h2>{renderMovieSummary()}{renderTotals()}<button type="button" disabled={paymentLoading} onClick={() => void handleConfirmBooking()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-[#E50914]/20 transition-all hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-60">{paymentLoading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Checking Payment</> : 'I Have Completed Payment'}</button></aside></div>;

  const renderSuccess = () => <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-2xl sm:p-10"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-400/30 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20"><CheckCircle2 className="h-12 w-12" /></div><p className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-400">Payment complete</p><h2 className="mt-2 text-3xl font-black text-foreground">Payment Successful!</h2><p className="mt-2 text-sm text-muted-foreground">Your booking has been confirmed. Enjoy the movie!</p><div className="mx-auto mt-7 max-w-md rounded-xl border border-border bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Booking Reference</p><div className="mt-2 flex items-center justify-center gap-2"><span className="font-mono text-lg font-black text-foreground">{confirmedBookingId}</span><button type="button" className="text-muted-foreground hover:text-foreground" title="Copy booking reference" onClick={() => void navigator.clipboard?.writeText(confirmedBookingId)}><Copy className="h-4 w-4" /></button></div></div><div className="mt-5 space-y-2 text-sm text-muted-foreground"><p className="font-bold text-foreground">{movie?.title}</p><p>{showtime?.cinemaName} · {showtime?.hallName}</p><p>{formatDate(showtime?.date || '')} at {showtime?.time} · Seats {selectedSeats.join(', ')}</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setStep('ticket')} className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3 text-xs font-bold text-white hover:bg-[#ff1f2d]"><Ticket className="h-4 w-4" /> View My Tickets</button><button type="button" onClick={() => navigate('/')} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary"><Home className="h-4 w-4" /> Back to Home</button></div></motion.section>;

  const renderTicket = () => <section className="mx-auto max-w-3xl space-y-5"><div className="rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8"><div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#E50914]">Your E-Ticket</p><h2 className="mt-1 text-2xl font-black text-foreground">My Tickets</h2></div><Badge variant="success" size="sm">Confirmed</Badge></div><div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]"><div className="space-y-4"><div className="flex items-start gap-4"><img src={movie?.posterUrl} alt={movie?.title || 'Movie poster'} className="h-32 w-24 rounded-xl object-cover" /><div><h3 className="text-lg font-black uppercase text-foreground">{movie?.title}</h3><p className="mt-2 text-sm text-muted-foreground">{showtime?.cinemaName} ({showtime?.format})</p><p className="mt-1 text-sm text-muted-foreground">{formatDate(showtime?.date || '')} at {showtime?.time}</p><p className="mt-1 text-sm text-muted-foreground">Seats: <span className="font-bold text-foreground">{selectedSeats.join(', ')}</span></p></div></div><div className="rounded-xl border border-border bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Booking Reference</p><p className="mt-1 font-mono text-lg font-black text-foreground">{confirmedBookingId}</p></div></div><div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-4"><img src={paymentQrUrl} alt="Ticket QR code" className="h-40 w-40" /><p className="mt-2 text-center text-[10px] font-semibold text-zinc-700">Show this QR code at the entrance</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={downloadTicket} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary"><Download className="h-4 w-4" /> Download</button><button type="button" onClick={() => navigate('/history')} className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3 text-xs font-bold text-white hover:bg-[#ff1f2d]"><Ticket className="h-4 w-4" /> Add to My Tickets</button></div></div><div className="rounded-2xl border border-border bg-card p-5"><h3 className="text-sm font-black text-foreground">Important</h3><ul className="mt-3 space-y-2 text-xs text-muted-foreground"><li>• Show this QR code at the cinema entrance.</li><li>• Arrive at least 15 minutes before your showtime.</li><li>• Have a great movie experience! 🍿</li></ul></div></section>;

  const renderCurrentStep = () => {
    if (step === 'seats') return renderSeatSelection();
    if (step === 'snacks') return renderSnackSelection();
    if (step === 'review') return renderReview();
    if (step === 'payment') return renderPayment();
    if (step === 'qr-payment') return renderQrPayment();
    if (step === 'ticket') return renderTicket();
    return renderSuccess();
  };

  const pageTitle = step === 'seats'
    ? 'Select Your Seats'
    : step === 'snacks'
      ? 'Add Snacks & Drinks'
      : step === 'review'
        ? 'Review Your Order'
        : step === 'payment'
          ? 'Select Payment Method'
          : step === 'qr-payment'
            ? 'Complete Payment'
            : step === 'ticket'
              ? 'Your E-Ticket'
              : 'Booking Success';

  return <div className="min-h-screen bg-background pb-20"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{renderStepHeader()}{step !== 'success' && <div className="mb-6 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><Link to={movie ? `/movies/${movie.id}` : '/movies'} className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Back to Movie</Link><h1 className="text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">{pageTitle}</h1><div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="font-bold text-[#E50914]">{showtime?.cinemaName}</span><span>·</span><span>{showtime?.hallName}</span><span>·</span><Badge variant="primary" size="sm">{showtime?.format}</Badge><span>·</span><span className="font-medium text-foreground">{formatDate(showtime?.date || '')} at {showtime?.time}</span></div></div>{step === 'seats' && <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded border border-border bg-muted" /> Available</span><span className="flex items-center gap-1.5 font-semibold text-foreground"><span className="h-3.5 w-3.5 rounded bg-[#E50914]" /> Selected</span><span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded bg-zinc-900 opacity-40" /> Occupied</span><span className="flex items-center gap-1.5 text-amber-400"><span className="h-3.5 w-3.5 rounded border border-amber-500 bg-amber-500/10" /> VIP</span></div>}</div>}{step === 'success' ? renderSuccess() : <AnimatePresence mode="wait" initial={false}><motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>{renderCurrentStep()}</motion.div></AnimatePresence>}{step !== 'success' && step !== 'seats' && step !== 'snacks' && step !== 'ticket' && <div className="mt-5 flex justify-start"><button type="button" onClick={() => goToStep(step === 'payment' ? 'review' : step === 'qr-payment' ? 'payment' : 'snacks')} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to previous step</button></div>}{step === 'snacks' && <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><Utensils className="h-4 w-4 text-[#E50914]" /> Snacks are optional—you can continue without adding anything.</div>}{step === 'success' && <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">Thank you for choosing Cinematique <Star className="h-4 w-4 fill-[#E50914] text-[#E50914]" /> See you at the movies!</div>}</div></div>;
};
