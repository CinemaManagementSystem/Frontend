import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Coffee,
  Cookie,
  Copy,
  CreditCard,
  Download,
  GlassWater,
  Home as HomeIcon,
  LoaderCircle,
  Minus,
  Plus,
  Popcorn,
  QrCode,
  ShieldCheck,
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

type FlowStepId = 'seats' | 'concessions' | 'checkout' | 'confirmation';
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

const FLOW_STEPS = [
  { id: 'seats', label: 'Seats', title: 'Select Your Seats', description: 'Choose available seats on the seat map' },
  { id: 'concessions', label: 'Concessions', title: 'Add Snacks & Drinks', description: 'Optional movie treats for your show' },
  { id: 'checkout', label: 'Checkout', title: 'Review & Pay', description: 'Confirm your order, choose a payment method and pay' },
  { id: 'confirmation', label: 'Confirmation', title: 'Booking Confirmed', description: 'Payment successful — here is your e-ticket' },
] as const;

type FlowStep = (typeof FLOW_STEPS)[number];

const SNACKS: SnackItem[] = [
  { id: 'classic-popcorn', name: 'Classic Popcorn', category: 'Popcorn', price: 4, imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=500&q=80' },
  { id: 'caramel-popcorn', name: 'Caramel Popcorn', category: 'Popcorn', price: 5, imageUrl: 'https://images.unsplash.com/photo-1625848198401-6f2b5a1a5f9f?auto=format&fit=crop&w=500&q=80' },
  { id: 'large-soda', name: 'Large Soda', category: 'Drink', price: 3, imageUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=500&q=80' },
  { id: 'nachos', name: 'Nachos', category: 'Snacks', price: 4.5, imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80' },
  { id: 'chocolate', name: 'Chocolate', category: 'Snacks', price: 3.5, imageUrl: 'https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=500&q=80' },
  { id: 'combo-set', name: 'Combo Set', category: 'Combo', price: 8, imageUrl: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?auto=format&fit=crop&w=500&q=80' },
];

const SNACK_CATEGORIES = ['All', 'Popcorn', 'Drink', 'Combo', 'Snacks'] as const;

type SnackCategoryId = (typeof SNACK_CATEGORIES)[number];

const SNACK_CATEGORY_ICONS: Record<SnackCategoryId, typeof Popcorn> = {
  All: Utensils,
  Popcorn,
  Drink: GlassWater,
  Combo: Coffee,
  Snacks: Cookie,
};

const PAYMENT_METHODS: { id: BookingPaymentMethod; name: string; description: string; icon: typeof CreditCard }[] = [
  { id: 'CREDIT_CARD', name: 'Credit / Debit Card', description: 'Visa, Mastercard, JCB', icon: CreditCard },
  { id: 'QR_CODE', name: 'QR Pay', description: 'Scan with your banking app', icon: QrCode },
];

const PRIMARY_CTA =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E50914]/30 transition-colors hover:bg-[#ff1f2d] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6';

const INPUT_CLASS =
  'w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20';

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

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
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

  const [step, setStep] = useState<FlowStepId>('seats');
  const [maxStepIndex, setMaxStepIndex] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [snackCategory, setSnackCategory] = useState<SnackCategoryId>('All');
  const [snackQuantities, setSnackQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('QR_CODE');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [backendBookingId, setBackendBookingId] = useState<number | null>(() =>
    parsePositiveId(searchParams.get('bookingId')),
  );
  const [checkoutPayment, setCheckoutPayment] = useState<CheckoutPayment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [snacksLoading, setSnacksLoading] = useState(false);
  const [billingName, setBillingName] = useState(user?.name || user?.username || '');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const backendOrderId = parsePositiveId(searchParams.get('orderId'));

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;
  const stepIndex = FLOW_STEPS.findIndex((flowStep) => flowStep.id === step);
  const currentFlowStep: FlowStep = FLOW_STEPS[stepIndex] ?? FLOW_STEPS[0];
  const isQrStep = paymentMethod === 'QR_CODE';
  const showQrPanel = isQrStep && checkoutPayment !== null;

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

  const snackItemCount = Object.values(snackQuantities).reduce((sum, qty) => sum + qty, 0);

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

  const goToStep = (nextStepId: FlowStepId) => {
    if (step === 'confirmation') return;
    if (nextStepId === 'concessions' && selectedSeats.length === 0) return;
    const nextIndex = FLOW_STEPS.findIndex((flowStep) => flowStep.id === nextStepId);
    setMaxStepIndex((current) => Math.max(current, nextIndex));
    if (nextStepId === 'concessions' && stepIndex === 0) {
      setSnacksLoading(true);
      window.setTimeout(() => setSnacksLoading(false), 550);
    }
    setStep(nextStepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    const backIndex = Math.max(0, stepIndex - 1);
    const backStep = FLOW_STEPS[backIndex];
    if (backStep.id === 'concessions' && selectedSeats.length === 0) {
      goToStep('seats');
      return;
    }
    goToStep(backStep.id);
  };

  const validateBilling = (): boolean => {
    if (!billingName.trim() || !billingEmail.trim()) {
      setPaymentError('Please enter a billing name and email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail.trim())) {
      setPaymentError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const ensureBackendBookingId = async (): Promise<number | null> => {
    if (backendBookingId) return backendBookingId;
    if (backendOrderId) return null;
    if (!user) throw new Error('Please sign in before creating a payment.');

    const showId = parseDemoShowId(showtimeId) ?? parseDemoShowId(showtime?.id);
    if (!showId) {
      throw new Error(
        'This showtime does not have a backend show id yet. Open booking from a backend showtime or pass bookingId/orderId in the URL.',
      );
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
    if (paymentLoading || !isQrStep) return;
    if (!validateBilling()) return;
    setPaymentError('');

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
    } catch (error) {
      setPaymentError(getApiErrorMessage(error, 'payment'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setPaymentError('');

    if (isQrStep && checkoutPayment) {
      try {
        setPaymentLoading(true);
        const payment = await paymentService.checkStatus(checkoutPayment.payment.id);
        const transactions = await paymentTransactionService
          .listByPayment(payment.id)
          .catch(() => checkoutPayment.transactions);
        const display = resolvePaymentQrDisplay(payment, transactions) ?? checkoutPayment.display;
        setCheckoutPayment({ payment, transactions, display });

        if (payment.status !== 'PAID') {
          setPaymentError(
            'Payment is still pending. Scan the QR code and wait for the backend payment status to become PAID.',
          );
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
      userName: billingName.trim() || user?.username || 'Guest User',
      userEmail: billingEmail.trim() || user?.email || 'guest@example.com',
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

    setConfirmedBookingId((current) => current || booking.id);
    setMaxStepIndex(FLOW_STEPS.length - 1);
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardConfirm = () => {
    if (paymentLoading || selectedSeats.length === 0) return;
    if (!validateBilling()) return;

    const cardDigits = cardNumber.replace(/\D/g, '');
    if (!/^\d{16}$/.test(cardDigits)) {
      setPaymentError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      setPaymentError('Please enter the card expiry as MM/YY.');
      return;
    }
    if (!/^\d{3,4}$/.test(cardCvc)) {
      setPaymentError('Please enter the card CVC.');
      return;
    }

    setPaymentError('');
    setPaymentLoading(true);
    window.setTimeout(() => {
      setPaymentLoading(false);
      void confirmBooking();
    }, 800);
  };

  const paymentReference =
    checkoutPayment?.display.reference ||
    confirmedBookingId ||
    `CIN-${(showtime?.date || '20260821').replace(/-/g, '')}-001234`;
  const paymentQrUrl =
    checkoutPayment?.display.qrImageSrc ||
    `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      `${paymentReference}|${grandTotal.toFixed(2)}|${movie?.title || 'Cinematique'}`,
    )}`;

  const downloadTicket = () => {
    const ticketText = [
      'CINEMATIQUE E-TICKET',
      `Booking Reference: ${confirmedBookingId || paymentReference}`,
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

  const renderStepper = () => (
    <nav className="overflow-x-auto pb-2 scrollbar-none" aria-label="Booking progress">
      <div className="flex min-w-[560px] items-start justify-between gap-2">
        {FLOW_STEPS.map((flowStep, index) => {
          const isActive = index === stepIndex;
          const isComplete = index < stepIndex;
          const canNavigate = index <= maxStepIndex && step !== 'confirmation';
          return (
            <React.Fragment key={flowStep.id}>
              <button
                type="button"
                onClick={() => goToStep(flowStep.id)}
                disabled={step === 'confirmation' || isActive || !canNavigate}
                aria-current={isActive ? 'step' : undefined}
                className={`group flex min-h-[4.5rem] shrink-0 flex-col items-center justify-start gap-2 rounded-xl border px-3 py-2 text-center transition-all disabled:cursor-default ${
                  isActive ? 'border-[#E50914] bg-[#E50914]/10' : 'border-border bg-card hover:border-[#E50914]/40'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black transition-all ${
                    isComplete || isActive
                      ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-[11px] font-bold ${
                    isActive ? 'text-[#E50914]' : 'text-muted-foreground'
                  }`}
                >
                  {flowStep.label}
                </span>
              </button>
              {index < FLOW_STEPS.length - 1 && (
                <div className={`mt-4 h-px flex-1 ${index < stepIndex ? 'bg-[#E50914]' : 'bg-border'}`} aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );

  const renderStepHeader = () => (
    <div className="mb-8 space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(movie ? `/movies/${movie.id}` : '/movies')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-secondary"
            aria-label="Back to movie"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E50914]">Cinematique</p>
            <h2 className="text-lg font-black uppercase text-foreground">Booking</h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#E50914]/30 bg-[#E50914]/10 px-3 py-2 text-[11px] font-black text-[#E50914]">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {showtime?.time || '15:00'}
          </div>
        </div>
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Step {stepIndex + 1} of {FLOW_STEPS.length}
            </p>
            <h1 className="mt-1 truncate text-2xl font-black uppercase text-foreground sm:text-3xl">
              {currentFlowStep.title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">{currentFlowStep.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-2">
            <img src={movie?.posterUrl} alt={movie?.title || 'Movie poster'} className="h-14 w-10 rounded-lg object-cover" />
            <div className="min-w-0 pr-2">
              <p className="max-w-52 truncate text-xs font-black uppercase text-foreground">
                {movie?.title || 'Selected movie'}
              </p>
              <p className="mt-1 max-w-52 truncate text-[11px] text-muted-foreground">
                {showtime?.cinemaName || 'Cinematique'} · {showtime?.format || 'IMAX'} · {showtime?.time || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {renderStepper()}
    </div>
  );

  const renderMovieSummary = () => (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 p-3">
      <img src={movie?.posterUrl} alt={movie?.title || 'Movie poster'} className="h-20 w-14 rounded-lg object-cover" />
      <div className="min-w-0 space-y-1">
        <h2 className="truncate text-sm font-black uppercase text-foreground">{movie?.title}</h2>
        <p className="text-[11px] font-semibold text-[#E50914]">{showtime?.cinemaName || 'Cinematique Grand Hall'}</p>
        <p className="text-[11px] text-muted-foreground">
          {showtime?.hallName || 'IMAX Theater 1'} · {formatDate(showtime?.date || '')} at {showtime?.time || '14:30'}
        </p>
      </div>
    </div>
  );

  const renderLegend = () => (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded border border-border bg-muted" /> Available
      </span>
      <span className="flex items-center gap-1.5 font-semibold text-foreground">
        <span className="h-3.5 w-3.5 rounded bg-[#E50914]" /> Selected
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded bg-muted seat-occupied" /> Occupied
      </span>
      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300">
        <span className="h-3.5 w-3.5 rounded border border-amber-500/50 bg-amber-500/15" /> VIP
      </span>
      <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-300">
        <span className="h-3.5 w-3.5 rounded border border-rose-500/50 bg-rose-500/15" /> Couple
      </span>
    </div>
  );

  const renderSeatSelection = () => (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8">
        <div className="mx-auto mb-6 max-w-lg space-y-2 text-center">
          <div className="screen-curve w-full" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">THEATER SCREEN</p>
        </div>

        {renderLegend()}

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
                    let seatClass = 'cursor-pointer border border-border bg-muted text-muted-foreground';
                    if (seatType === 'VIP') {
                      seatClass =
                        'cursor-pointer border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300';
                    } else if (seatType === 'COUPLE') {
                      seatClass =
                        'cursor-pointer border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300';
                    }
                    if (occupied) {
                      seatClass = 'seat-occupied cursor-not-allowed border-transparent bg-muted opacity-45';
                    } else if (selected) {
                      seatClass =
                        'scale-110 cursor-pointer border-transparent bg-[#E50914] font-bold text-white shadow-lg shadow-[#E50914]/50';
                    }
                    const hoverClass = occupied
                      ? ''
                      : selected
                        ? ''
                        : seatType === 'VIP'
                          ? 'hover:border-amber-500/70 hover:bg-amber-500/25 hover:text-amber-700 hover:shadow-[0_6px_16px_rgba(245,158,11,0.28)] dark:hover:text-amber-200'
                          : seatType === 'COUPLE'
                            ? 'hover:border-rose-500/70 hover:bg-rose-500/25 hover:text-rose-700 hover:shadow-[0_6px_16px_rgba(244,63,94,0.28)] dark:hover:text-rose-200'
                            : 'hover:border-[#E50914]/60 hover:bg-[#E50914]/10 hover:text-[#E50914] hover:shadow-[0_6px_16px_rgba(229,9,20,0.24)]';
                    return (
                      <motion.button
                        key={seatId}
                        type="button"
                        disabled={occupied}
                        onClick={() => handleSeatClick(seatId)}
                        whileHover={occupied ? {} : { scale: 1.12, y: -2 }}
                        whileTap={occupied ? {} : { scale: 0.9 }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${seatClass} ${hoverClass}`}
                        title={`${seatId} (${seatType} - ${formatCurrency(price)})`}
                        aria-label={`${seatId}, ${occupied ? 'occupied' : selected ? 'selected' : 'available'}, ${seatType}`}
                      >
                        {!occupied && index + 1}
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
          <div className="rounded-xl bg-muted p-3">
            <span className="block text-[11px] font-medium text-muted-foreground">Standard · Rows A-E</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(showtime?.price || 15)}</span>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <span className="block text-[11px] font-medium text-amber-600 dark:text-amber-300">VIP Lounge · Rows F-G</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(showtime?.vipPrice || 22)}</span>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
            <span className="block text-[11px] font-medium text-rose-600 dark:text-rose-300">Couple Suite · Row H</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency((showtime?.vipPrice || 22) + 8)}</span>
          </div>
        </div>
      </div>

      <aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl lg:sticky lg:top-24">
        <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-black uppercase tracking-wider text-foreground">
          <Ticket className="h-4 w-4 text-[#E50914]" /> Booking Summary
        </h2>
        {renderMovieSummary()}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Selected Seats</span>
            <span className="font-bold text-foreground">{selectedSeats.length} / 8</span>
          </div>
          {selectedSeats.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seatId) => (
                <span key={seatId} className="rounded-md bg-[#E50914] px-2.5 py-1 text-xs font-bold text-white">
                  {seatId}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">No seats selected yet.</p>
          )}
        </div>
        <div className="space-y-2 border-t border-border pt-4 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Tickets</span>
            <span className="font-semibold text-foreground">{formatCurrency(ticketSubtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Convenience Fee</span>
            <span className="font-semibold text-foreground">{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-sm font-bold">
            <span>Total</span>
            <span className="text-[#E50914]">{formatCurrency(ticketSubtotal + serviceFee)}</span>
          </div>
        </div>
        <p className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
          Your running total is always visible in the sticky bar below.
        </p>
      </aside>
    </div>
  );

  const renderSnackSelection = () => {
    const categoryCount = (category: SnackCategoryId) =>
      category === 'All' ? SNACKS.length : SNACKS.filter((snack) => snack.category === category).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter snacks by category">
          {SNACK_CATEGORIES.map((category) => {
            const Icon = SNACK_CATEGORY_ICONS[category];
            const active = snackCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSnackCategory(category)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? 'border-[#E50914] bg-[#E50914] text-white shadow-md shadow-[#E50914]/25'
                    : 'border-border bg-card text-muted-foreground hover:border-[#E50914]/40 hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {category}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-black tabular-nums ${
                    active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {categoryCount(category)}
                </span>
              </button>
            );
          })}
        </div>

        {snacksLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading snacks">
            {Array.from({ length: 6 }, (_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="aspect-[1.15] animate-pulse bg-muted" />
                <div className="space-y-3 p-3">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredSnacks.map((snack) => {
              const quantity = snackQuantities[snack.id] ?? 0;
              return (
                <motion.article
                  key={snack.id}
                  whileHover={{ y: -4, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-[#E50914]/15 hover:ring-1 hover:ring-[#E50914]/40"
                >
                  <div className="aspect-[1.15] overflow-hidden bg-muted">
                    <SnackImage name={snack.name} category={snack.category} src={snack.imageUrl} />
                  </div>
                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-foreground">{snack.name}</h3>
                      <span className="inline-flex shrink-0 items-center rounded-full bg-[#E50914]/10 px-2 py-0.5 text-[11px] font-black text-[#E50914]">
                        {formatCurrency(snack.price)}
                      </span>
                    </div>
                    <div>
                      {quantity === 0 ? (
                        <button
                          type="button"
                          onClick={() => updateSnackQuantity(snack.id, 1)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E50914]/40 bg-[#E50914]/10 px-3 py-2 text-xs font-bold text-[#E50914] transition-colors hover:bg-[#E50914] hover:text-white"
                          aria-label={`Add ${snack.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          Add
                        </button>
                      ) : (
                        <motion.div
                          key={`qty-${quantity}`}
                          initial={{ scale: 0.94 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="flex w-full items-center justify-between rounded-lg bg-[#E50914] p-1"
                        >
                          <button
                            type="button"
                            onClick={() => updateSnackQuantity(snack.id, -1)}
                            className="flex h-7 w-9 items-center justify-center rounded-md text-white hover:bg-white/20"
                            aria-label={`Remove one ${snack.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <motion.span
                            key={`count-${quantity}`}
                            initial={{ scale: 1.25 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                            className="min-w-[1.5rem] text-center text-sm font-black text-white tabular-nums"
                          >
                            {quantity}
                          </motion.span>
                          <button
                            type="button"
                            onClick={() => updateSnackQuantity(snack.id, 1)}
                            className="flex h-7 w-9 items-center justify-center rounded-md text-white hover:bg-white/20"
                            aria-label={`Add one ${snack.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderOrderLines = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-bold text-foreground">Tickets ({selectedSeats.length})</span>
        <span className="text-xs font-bold text-foreground">{formatCurrency(ticketSubtotal)}</span>
      </div>
      {selectedSeats.map((seatId) => (
        <div key={seatId} className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Seat {seatId} · {getSeatType(seatId[0])}
          </span>
          <span>{formatCurrency(getSeatPrice(seatId[0]))}</span>
        </div>
      ))}
      {selectedSnackItems.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-foreground">
            <span>Snacks & Drinks</span>
            <span>{formatCurrency(snacksSubtotal)}</span>
          </div>
          {selectedSnackItems.map((snack) => (
            <div key={snack.id} className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {snack.name} × {snackQuantities[snack.id]}
              </span>
              <span>{formatCurrency(snack.price * snackQuantities[snack.id])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTotals = () => (
    <div className="space-y-3 border-t border-border pt-4 text-xs">
      <div className="flex justify-between text-muted-foreground">
        <span>Tickets</span>
        <span>{formatCurrency(ticketSubtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Snacks</span>
        <span>{formatCurrency(snacksSubtotal)}</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>Convenience Fee</span>
        <span>{formatCurrency(serviceFee)}</span>
      </div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-black text-foreground">
        <span>Total Amount</span>
        <span className="text-[#E50914]">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );

  const renderQrPanel = () => (
    <div className="space-y-2 text-center">
      <div className="flex items-center gap-2 border-b border-border pb-4 text-left">
        <QrCode className="h-5 w-5 text-[#E50914]" />
        <div>
          <h2 className="text-lg font-black uppercase text-foreground">Scan to Pay</h2>
          <p className="text-xs text-muted-foreground">Complete the payment in your banking app, then confirm below</p>
        </div>
      </div>
      <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-4 shadow-xl">
        <img src={paymentQrUrl} alt="KHQR payment code" className="h-56 w-56" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">Scan this QR code with your banking app</p>
      <p className="text-xs text-muted-foreground">ABA, ACLEDA, Wing, Bakong, and other supported apps</p>
      <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>
          Reference:{' '}
          <span className="font-mono font-bold text-foreground">{paymentReference}</span>
        </span>
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-foreground"
          title="Copy booking reference"
          onClick={() => void navigator.clipboard?.writeText(paymentReference)}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      {checkoutPayment && checkoutPayment.display.qrPayload === checkoutPayment.payment.transactionId && (
        <p className="mx-auto max-w-md rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          Backend did not return a KHQR payload, so this QR uses the payment transaction reference.
        </p>
      )}
      <button
        type="button"
        onClick={() => setCheckoutPayment(null)}
        className="mt-2 text-xs font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
      >
        Use a different payment method
      </button>
      {paymentError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-left text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{paymentError}</span>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8">
        {showQrPanel ? (
          renderQrPanel()
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <CreditCard className="h-5 w-5 text-[#E50914]" />
                <div>
                  <h2 className="text-lg font-black uppercase text-foreground">Payment Method</h2>
                  <p className="text-xs text-muted-foreground">Choose how you want to pay</p>
                </div>
              </div>
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id);
                      setCheckoutPayment(null);
                      setPaymentError('');
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-[#E50914] bg-[#E50914]/10 shadow-lg shadow-[#E50914]/10'
                        : 'border-border bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        active ? 'bg-[#E50914] text-white' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{method.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        active ? 'border-[#E50914] bg-[#E50914]' : 'border-muted-foreground/50'
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {isQrStep ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                <QrCode className="h-5 w-5 shrink-0 text-[#E50914]" />
                Press “Generate QR Code” in the sticky bar below to create a KHQR payment you can scan with your banking app.
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#E50914]" />
                  <p className="text-sm font-bold text-foreground">Card Details</p>
                </div>
                <input
                  className={INPUT_CLASS}
                  placeholder="Card Number  (e.g. 4242 4242 4242 4242)"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                  aria-label="Card number"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={INPUT_CLASS}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
                    aria-label="Card expiry"
                  />
                  <input
                    className={INPUT_CLASS}
                    placeholder="CVC"
                    inputMode="numeric"
                    value={cardCvc}
                    onChange={(event) => setCardCvc(event.target.value.replace(/\D/g, '').slice(0, 4))}
                    aria-label="Card CVC"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Demo checkout — no real payment is processed and your card details stay in this session.
                </p>
              </div>
            )}

            <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#E50914]" />
                <p className="text-sm font-bold text-foreground">Billing Details</p>
              </div>
              <input
                className={INPUT_CLASS}
                placeholder="Full name"
                value={billingName}
                onChange={(event) => setBillingName(event.target.value)}
                aria-label="Billing name"
              />
              <input
                className={INPUT_CLASS}
                type="email"
                placeholder="Email address"
                value={billingEmail}
                onChange={(event) => setBillingEmail(event.target.value)}
                aria-label="Billing email"
              />
            </div>

            {paymentError && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{paymentError}</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
              Secure checkout. Payments are encrypted and processed in-session.
            </div>
          </>
        )}
      </div>

      <aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl lg:sticky lg:top-24">
        <h2 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-black uppercase tracking-wider text-foreground">
          <Ticket className="h-4 w-4 text-[#E50914]" /> Order Summary
        </h2>
        {renderMovieSummary()}
        <div className="rounded-xl border border-border bg-muted/40 p-4">{renderOrderLines()}</div>
        {renderTotals()}
      </aside>
    </div>
  );

  const renderTicket = () => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-8"
    >
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#E50914]">Your E-Ticket</p>
          <h2 className="mt-1 text-2xl font-black text-foreground">My Tickets</h2>
        </div>
        <Badge variant="success" size="sm">
          Confirmed
        </Badge>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <img src={movie?.posterUrl} alt={movie?.title || 'Movie poster'} className="h-32 w-24 rounded-xl object-cover" />
            <div>
              <h3 className="text-lg font-black uppercase text-foreground">{movie?.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {showtime?.cinemaName} ({showtime?.format})
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(showtime?.date || '')} at {showtime?.time}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Seats: <span className="font-bold text-foreground">{selectedSeats.join(', ')}</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Booking Reference</p>
            <p className="mt-1 font-mono text-lg font-black text-foreground">{confirmedBookingId || paymentReference}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white p-4">
          <img src={paymentQrUrl} alt="Ticket QR code" className="h-40 w-40" />
          <p className="mt-2 text-center text-[10px] font-semibold text-zinc-700">Show this QR code at the entrance</p>
        </div>
      </div>
    </motion.div>
  );

  const renderConfirmation = () => (
    <section className="mx-auto max-w-3xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 text-center shadow-2xl sm:p-10"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-400/30 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-12 w-12" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Payment complete
        </p>
        <h2 className="mt-2 text-3xl font-black text-foreground">Payment Successful!</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your booking has been confirmed. Enjoy the movie!</p>
        <div className="mx-auto mt-7 max-w-md rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">Booking Reference</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="font-mono text-lg font-black text-foreground">{confirmedBookingId || paymentReference}</span>
            <button
              type="button"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="Copy booking reference"
              onClick={() => void navigator.clipboard?.writeText(confirmedBookingId || paymentReference)}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <p className="font-bold text-foreground">{movie?.title}</p>
          <p>
            {showtime?.cinemaName} · {showtime?.hallName}
          </p>
          <p>
            {formatDate(showtime?.date || '')} at {showtime?.time} · Seats {selectedSeats.join(', ')}
          </p>
        </div>
      </motion.div>

      {renderTicket()}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={downloadTicket}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#E50914] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#ff1f2d]"
        >
          <Download className="h-4 w-4" aria-hidden="true" /> Download Ticket
        </button>
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
        >
          <Ticket className="h-4 w-4" aria-hidden="true" /> View My Tickets
        </button>
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <HomeIcon className="h-3.5 w-3.5" aria-hidden="true" /> Back to Home
        </button>
      </div>
    </section>
  );

  const renderStickyCta = () => {
    if (step === 'seats') {
      return (
        <button
          type="button"
          onClick={() => goToStep('concessions')}
          disabled={selectedSeats.length === 0}
          className={PRIMARY_CTA}
        >
          Proceed to Snacks <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      );
    }

    if (step === 'concessions') {
      return (
        <>
          {snackItemCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSnackQuantities({});
                goToStep('checkout');
              }}
              className="hidden text-xs font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline sm:inline"
            >
              Skip snacks
            </button>
          )}
          <button type="button" onClick={() => goToStep('checkout')} className={PRIMARY_CTA}>
            {snackItemCount > 0 ? 'Proceed to Checkout' : 'Skip Snacks & Continue'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      );
    }

    if (isQrStep && !showQrPanel) {
      return (
        <button
          type="button"
          onClick={() => void startBackendPayment()}
          disabled={paymentLoading || selectedSeats.length === 0}
          className={PRIMARY_CTA}
        >
          {paymentLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <QrCode className="h-4 w-4" aria-hidden="true" />
          )}
          Generate QR Code <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      );
    }

    if (isQrStep && showQrPanel) {
      return (
        <button
          type="button"
          onClick={() => void confirmBooking()}
          disabled={paymentLoading || selectedSeats.length === 0}
          className={PRIMARY_CTA}
        >
          {paymentLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          )}
          Confirm Booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleCardConfirm}
        disabled={paymentLoading || selectedSeats.length === 0}
        className={PRIMARY_CTA}
      >
        {paymentLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        )}
        Pay & Confirm Booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  };

  const renderStickyBar = () => {
    const caption =
      step === 'seats'
        ? `${selectedSeats.length} of 8 seats selected`
        : step === 'concessions'
          ? `${selectedSeats.length} seats · ${snackItemCount} snacks`
          : 'Total amount payable';

    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {step !== 'seats' && (
              <button
                type="button"
                onClick={goBack}
                className="hidden items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                aria-label="Go back to the previous step"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Back
              </button>
            )}
            <div className="min-w-0">
              <p className="truncate text-[11px] text-muted-foreground">{caption}</p>
              <p className="truncate text-base font-black text-foreground tabular-nums">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">{renderStickyCta()}</div>
        </div>
      </motion.div>
    );
  };

  const renderCurrentStep = () => {
    if (step === 'seats') return renderSeatSelection();
    if (step === 'concessions') return renderSnackSelection();
    if (step === 'checkout') return renderCheckout();
    return renderConfirmation();
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderStepHeader()}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>{step !== 'confirmation' && renderStickyBar()}</AnimatePresence>
    </div>
  );
};