import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock3,
  Coffee,
  Cookie,
  Copy,
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
  type LucideIcon,
} from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { useAuthStore } from '@/store/authStore';
import { useCheckoutCartStore } from '@/store/checkoutCartStore';
import { Badge } from '@/components/ui/Badge/Badge';
import { PromoCodeInput } from '@/components/promotions';
import { formatCurrency, formatDate } from '@/utils/formatDate';
import { bookingAdminService } from '@/services/bookingAdminService';
import { getApiErrorMessage } from '@/services/apiClient';
import { paymentService } from '@/services/paymentService';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import { promotionApi } from '@/services/promotionApi';
import { showService } from '@/services/showService';
import { seatService } from '@/services/seatService';
import { bookingSeatService } from '@/services/bookingSeatService';
import { productService } from '@/services/productService';
import { productCategoryService } from '@/services/productCategoryService';
import { orderService } from '@/services/orderService';
import { syncCheckoutOrder, type CheckoutOrderDraft } from '@/services/checkoutOrderService';
import { QR_VALIDITY_SECONDS, STATUS_POLL_SECONDS } from '@/lib/gatewayQr';
import { resolvePaymentQrDisplay, type PaymentQrDisplay } from '@/lib/paymentQr';
import type { Payment as ApiPayment } from '@/types/payment';
import type { PaymentTransaction } from '@/types/paymentTransaction';
import { SnackImage } from './SnackImage';
import { parseShowId, seatLabel, seatsForScreen, showUnavailableReason } from '@/lib/bookingSeats';
import type { Seat as ApiSeat } from '@/types/seat';
import type { Show } from '@/types/show';
import type { CartItemForPromotion } from '@/types/promotion';
import { getCinemaDateTime } from '@/lib/showtime';
import { useShowtimeClock } from '@/hooks/useShowtimeClock';

type FlowStepId = 'seats' | 'concessions' | 'checkout' | 'confirmation';
type BookingPaymentMethod = 'CASH' | 'QR_CODE';

interface CheckoutPayment {
  payment: ApiPayment;
  transactions: PaymentTransaction[];
  display: PaymentQrDisplay;
}

interface SnackItem {
  id: string;
  name: string;
  category: string;
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

const DEFAULT_SNACK_CATEGORIES = ['All'];
type SnackCategoryId = string;

const categoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('popcorn')) return Popcorn;
  if (normalized.includes('drink') || normalized.includes('beverage')) return GlassWater;
  if (normalized.includes('combo')) return Coffee;
  if (normalized.includes('snack')) return Cookie;
  return Utensils;
};

const PAYMENT_METHODS: { id: BookingPaymentMethod; name: string; description: string; icon: LucideIcon }[] = [
  { id: 'CASH', name: 'Cash', description: 'Pay at the cinema counter', icon: Banknote },
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

export const BookingPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [params] = useSearchParams();
  return <BookingFlow key={`${showtimeId}:${params.toString()}`} />;
};

const BookingFlow: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showtimes, getMovieById, fetchCatalog } = useMovieStore();
  const { user, isAuthenticated, isAuthLoading } = useAuthStore();
  const now = useShowtimeClock();
  const needsLogin = !isAuthLoading && (!isAuthenticated || !user);
  const loginRedirect = `${location.pathname}${location.search}`;

  const backendShowId = parseShowId(searchParams.get('showId') ?? showtimeId);
  const showtime = showtimes.find((show) => parseShowId(show.id) === backendShowId);
  const movie = getMovieById(showtime?.movieId ?? '');

  const [step, setStep] = useState<FlowStepId>('seats');
  const [maxStepIndex, setMaxStepIndex] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [activeSeatFilter, setActiveSeatFilter] = useState<'ALL' | 'AVAILABLE' | 'SELECTED' | 'OCCUPIED' | 'STANDARD' | 'VIP' | 'COUPLE'>('ALL');
  const [snackCategory, setSnackCategory] = useState<SnackCategoryId>('All');
  const [snacks, setSnacks] = useState<SnackItem[]>([]);
  const [snackCategories, setSnackCategories] = useState<string[]>(DEFAULT_SNACK_CATEGORIES);
  const [snackQuantities, setSnackQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>('QR_CODE');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');
  const [backendBookingId, setBackendBookingId] = useState<number | null>(() =>
    parsePositiveId(searchParams.get('bookingId')),
  );
  const [checkoutPayment, setCheckoutPayment] = useState<CheckoutPayment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [promotionCode, setPromotionCode] = useState('');
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [snacksLoading, setSnacksLoading] = useState(false);
  const [billingName, setBillingName] = useState(user?.name || user?.username || '');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');
  const [screenSeats, setScreenSeats] = useState<ApiSeat[]>([]);
  const [loadedShow, setLoadedShow] = useState<Show | null>(null);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [seatsError, setSeatsError] = useState('');
  const [reloadSeats, setReloadSeats] = useState(0);
  const backendOrderId = parsePositiveId(searchParams.get('orderId'));
  const checkoutBusy = useRef(false);
  const paymentStatusRequest = useRef(false);
  const checkoutPaymentRef = useRef<CheckoutPayment | null>(null);
  const orderDraft = useRef<CheckoutOrderDraft>({ id: backendOrderId, orderNumber: '' });

  useEffect(() => {
    void fetchCatalog().catch((error) => setSeatsError(getApiErrorMessage(error, 'showtimes')));
  }, [fetchCatalog]);

  useEffect(() => {
    if (!needsLogin) return;
    navigate(`/login?redirect=${encodeURIComponent(loginRedirect)}`, { replace: true });
  }, [loginRedirect, navigate, needsLogin]);

  useEffect(() => {
    checkoutPaymentRef.current = checkoutPayment;
  }, [checkoutPayment]);

  useEffect(() => {
    if (needsLogin) {
      setSnacks([]);
      setSnackCategories(DEFAULT_SNACK_CATEGORIES);
      return;
    }
    const loadConcessions = async () => {
      try {
        const [products, categories] = await Promise.all([productService.list(), productCategoryService.list()]);
        const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
        const availableProducts = products.filter((product) => product.isAvailable && product.stockQuantity > 0);
        const toSnackCategory = (name: string): SnackItem['category'] => {
          const normalized = name.toLowerCase();
          if (normalized.includes('popcorn')) return 'Popcorn';
          if (normalized.includes('drink') || normalized.includes('beverage')) return 'Drink';
          if (normalized.includes('combo')) return 'Combo';
          return 'Snacks';
        };
        setSnacks(availableProducts.map((product) => ({
          id: String(product.id),
          name: product.name,
          category: toSnackCategory(categoryNames.get(product.productCategoryId) || 'Snacks'),
          price: product.price,
          imageUrl: product.imageUrl || '',
        })));
        setSnackCategories([
          'All',
          ...Array.from(new Set(availableProducts.map((product) => toSnackCategory(categoryNames.get(product.productCategoryId) || 'Snacks')))),
        ]);
      } catch {
        setSnacks([]);
        setSnackCategories(DEFAULT_SNACK_CATEGORIES);
      }
    };
    void loadConcessions();
  }, [needsLogin]);

  useEffect(() => {
    if (needsLogin) {
      setLoadedShow(null);
      setScreenSeats([]);
      setSeatsLoading(false);
      return;
    }
    let cancelled = false;

    const loadSeats = async () => {
      setSeatsLoading(true);
      setSeatsError('');
      setLoadedShow(null);
      setScreenSeats([]);
      try {
        if (!backendShowId) throw new Error('This showtime link is invalid. Please select a showtime again.');
        const show = await showService.getById(backendShowId);
        if (cancelled) return;
        setLoadedShow(show);
        if (showUnavailableReason(show)) return;
        const seats = await seatService.list();
        if (cancelled) return;
        setScreenSeats(seatsForScreen(seats, show.screenId));
      } catch (error) {
        if (!cancelled) setSeatsError(getApiErrorMessage(error, 'seats'));
      } finally {
        if (!cancelled) setSeatsLoading(false);
      }
    };

    void loadSeats();
    return () => {
      cancelled = true;
    };
  }, [backendShowId, reloadSeats, needsLogin]);

  const rows = Array.from(new Set(screenSeats.map((seat) => seat.rowName)));
  const seatsByLabel = new Map(screenSeats.map((seat) => [seatLabel(seat), seat]));
  const stepIndex = FLOW_STEPS.findIndex((flowStep) => flowStep.id === step);
  const currentFlowStep: FlowStep = FLOW_STEPS[stepIndex] ?? FLOW_STEPS[0];
  const isQrStep = paymentMethod === 'QR_CODE';
  const showQrPanel = isQrStep && checkoutPayment !== null;

  const getSeatType = (label: string) => seatsByLabel.get(label)?.seatType.toUpperCase() ?? '';
  const getSeatPrice = (label: string) => Number(seatsByLabel.get(label)?.price ?? 0);
  const isSeatOccupied = (label: string) => !seatsByLabel.has(label) || seatsByLabel.get(label)?.status.toUpperCase() !== 'AVAILABLE';

  const filteredSnacks = useMemo(
    () => snacks.filter((snack) => snackCategory === 'All' || snack.category === snackCategory),
    [snackCategory, snacks],
  );

  const selectedSnackItems = useMemo(
    () => snacks.filter((snack) => (snackQuantities[snack.id] ?? 0) > 0),
    [snackQuantities, snacks],
  );

  const snackItemCount = Object.values(snackQuantities).reduce((sum, qty) => sum + qty, 0);

  const ticketSubtotal = selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId), 0);
  const snacksSubtotal = selectedSnackItems.reduce(
    (total, snack) => total + snack.price * (snackQuantities[snack.id] ?? 0),
    0,
  );
  // The backend has no convenience-fee field; payment totals must match its ticket/order totals.
  const serviceFee = 0;
  const grandTotal = ticketSubtotal + snacksSubtotal + serviceFee;
  const discountedTotal = Math.max(0, Number((grandTotal - promotionDiscount).toFixed(2)));
  const promotionCartItems = useMemo<CartItemForPromotion[]>(() => {
    const seatItems = selectedSeats.map((seatId) => ({
      showId: backendShowId ?? showtimeId,
      quantity: 1,
      unitPrice: getSeatPrice(seatId),
    }));
    const snackItems = selectedSnackItems.map((snack) => ({
      productId: snack.id,
      quantity: snackQuantities[snack.id] ?? 0,
      unitPrice: snack.price,
    }));
    return [...seatItems, ...snackItems].filter((item) => item.quantity > 0);
  }, [backendShowId, selectedSeats, selectedSnackItems, showtimeId, snackQuantities]);

  const updateSnackQuantity = (snackId: string, change: number) => {
    if (checkoutBusy.current || checkoutPayment) return;
    setSnackQuantities((current) => ({
      ...current,
      [snackId]: Math.max(0, (current[snackId] ?? 0) + change),
    }));
  };

  const handleSeatClick = (seatId: string) => {
    if (checkoutBusy.current || checkoutPayment) return;
    if (isSeatOccupied(seatId)) return;
    setSelectedSeats((current) => {
      if (current.includes(seatId)) return current.filter((seat) => seat !== seatId);
      if (current.length >= 8) return current;
      return [...current, seatId];
    });
  };

  const goToStep = (nextStepId: FlowStepId) => {
    if (checkoutBusy.current || checkoutPayment) return;
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

  const ensureBackendShowId = async (): Promise<number> => {
    if (!backendShowId || !loadedShow || seatsLoading || seatsError) {
      throw new Error('Please wait for the seat map to load or choose a showtime again.');
    }
    return backendShowId;
  };

  const ensureBackendBookingId = async (): Promise<{ id: number | null; total: number | null }> => {
    if (backendOrderId && !backendBookingId) return { id: null, total: null };
    if (!user) throw new Error('Please sign in before creating a payment.');

    const showId = await ensureBackendShowId();

    const [freshShow, seats] = await Promise.all([showService.getById(showId), seatService.list()]);
    const unavailable = showUnavailableReason(freshShow);
    if (unavailable) throw new Error(unavailable);
    const showSeats = seatsForScreen(seats, freshShow.screenId);
    const backendSeats = selectedSeats.map((label) => {
      const displayed = seatsByLabel.get(label);
      const seat = showSeats.find((candidate) => candidate.id === displayed?.id);
      if (!seat || seatLabel(seat) !== label || seat.status.toUpperCase() !== 'AVAILABLE') {
        throw new Error(`Seat ${label} is no longer available. Please return to seat selection and reload the map.`);
      }
      return seat;
    });
    // Validate the selected records before creating an empty booking.
    const existingBooking = backendBookingId ? await bookingAdminService.getById(backendBookingId) : null;
    if (existingBooking && existingBooking.showId !== showId) {
      throw new Error('This booking belongs to a different showtime. Please reopen its original showtime.');
    }

    const booking = existingBooking ?? await bookingAdminService.create({
      bookingCode: `BK-${Date.now()}`,
      bookedAt: new Date().toISOString().slice(0, 19),
      status: 'PENDING',
      totalAmount: Number(grandTotal.toFixed(2)),
      customerId: user.id,
      showId,
    });
    setBackendBookingId(booking.id);
    setConfirmedBookingId(booking.bookingCode);

    const reserved = (await bookingSeatService.list()).filter((seat) => seat.bookingId === booking.id && seat.status !== 'CANCELLED');
    for (const seat of reserved) {
      if (!backendSeats.some((selected) => selected.id === seat.seatId)) await bookingSeatService.remove(seat.id);
    }
    for (const seat of backendSeats) {
      if (!reserved.some((saved) => saved.seatId === seat.id)) {
        await bookingSeatService.create({ bookingId: booking.id, seatId: seat.id });
      }
    }

    setBackendBookingId(booking.id);
    setConfirmedBookingId(booking.bookingCode);
    return { id: booking.id, total: backendSeats.reduce((sum, seat) => sum + seat.price, 0) };
  };

  const createBackendOrder = async (bookingId: number): Promise<number | null> => {
    if (!user) throw new Error('Please sign in before checkout.');
    if (!orderDraft.current.orderNumber) orderDraft.current.orderNumber = `ORDER-${crypto.randomUUID()}`;
    return syncCheckoutOrder(orderDraft.current, bookingId, user.id, selectedSnackItems.map((snack) => ({
      productId: Number(snack.id), quantity: snackQuantities[snack.id] ?? 0, unitPrice: snack.price,
    })));
  };

  const startGatewayPayment = async (method: 'KHQR' | 'CASH') => {
    if (checkoutBusy.current || paymentLoading || selectedSeats.length === 0) return;
    if (!validateBilling()) return;
    checkoutBusy.current = true;
    setPaymentError('');

    try {
      setPaymentLoading(true);
      if (!user) throw new Error('Please sign in before creating a payment.');

      const booking = await ensureBackendBookingId();
      const orderId = booking.id ? await createBackendOrder(booking.id) : backendOrderId;
      const [savedBooking, savedOrder] = await Promise.all([
        booking.id ? bookingAdminService.getById(booking.id) : null,
        orderId ? orderService.getById(orderId) : null,
      ]);
      const amount = Number((Number(savedBooking?.totalAmount ?? 0) + Number(savedOrder?.totalAmount ?? 0)).toFixed(2));
      if (Math.round(amount * 100) !== Math.round(grandTotal * 100)) {
        throw new Error('Prices have changed. Please reload and review your order before paying.');
      }
      let finalAmount = amount;
      let finalPromotionCode = '';
      let finalDiscountAmount = 0;
      if (promotionCode) {
        const validation = await promotionApi.validate({
          code: promotionCode,
          cartItems: promotionCartItems,
          subtotal: amount,
        });
        if (!validation.valid) {
          setPromotionCode('');
          setPromotionDiscount(0);
          throw new Error(validation.message || 'Promotion code is no longer valid. You can continue without it.');
        }
        finalPromotionCode = validation.code ?? promotionCode;
        finalDiscountAmount = Number(validation.discountAmount || 0);
        finalAmount = Number((validation.total ?? Math.max(0, amount - finalDiscountAmount)).toFixed(2));
      }
      if (booking.id) useCheckoutCartStore.getState().setCheckout(booking.id, selectedSnackItems.map((snack) => ({
        productId: Number(snack.id), quantity: snackQuantities[snack.id] ?? 0, unitPrice: snack.price,
      })));
      navigate(`/payment/${booking.id}`, { state: {
        bookingId: booking.id,
        orderId,
        totalAmount: finalAmount,
        paymentMethod: method,
        promotionCode: finalPromotionCode || null,
        discountAmount: finalDiscountAmount || null,
        formData: { name: billingName, email: billingEmail },
      } });
    } catch (error) {
      setPaymentError(getApiErrorMessage(error, 'payment'));
    } finally {
      checkoutBusy.current = false;
      setPaymentLoading(false);
    }
  };

  const completePaidCheckout = useCallback((payment: ApiPayment) => {
    setCheckoutPayment((current) => current ? { ...current, payment } : current);
    setConfirmedBookingId((current) => current || String(payment.bookingId ?? backendBookingId ?? payment.id));
    setMaxStepIndex(FLOW_STEPS.length - 1);
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [backendBookingId]);

  const refreshPaymentStatus = useCallback(async (
    showPendingMessage: boolean,
    source: 'scheduled' | 'manual' | 'final' = 'manual',
  ) => {
    const activeCheckout = checkoutPaymentRef.current;
    if (!activeCheckout || paymentStatusRequest.current) return;
    paymentStatusRequest.current = true;
    try {
      const payment = await paymentService.checkStatus(activeCheckout.payment.id, source);
      const transactions = await paymentTransactionService
        .listByPayment(payment.id)
        .catch(() => activeCheckout.transactions);
      const display = resolvePaymentQrDisplay(payment, transactions) ?? activeCheckout.display;
      setCheckoutPayment({ payment, transactions, display });

      if (payment.status === 'PAID') {
        setPaymentError('');
        completePaidCheckout(payment);
      } else if (payment.status === 'FAILED' || payment.status === 'EXPIRED') {
        setPaymentError(`Payment ${payment.status.toLowerCase()}. Please generate a new QR code and try again.`);
      } else if (payment.rateLimitedUntil) {
        setPaymentError('Bakong verification is temporarily unavailable. Please try again later.');
      } else if (showPendingMessage) {
        setPaymentError(payment.lastVerificationError
          || 'Payment is still pending. The page will confirm your booking automatically once payment is received.');
      }
    } catch (error) {
      if (showPendingMessage) setPaymentError(getApiErrorMessage(error, 'payment status'));
    } finally {
      paymentStatusRequest.current = false;
    }
  }, [completePaidCheckout]);

  const pendingPaymentId = checkoutPayment?.payment.status === 'PENDING' ? checkoutPayment.payment.id : null;

  useEffect(() => {
    if (!isQrStep || !pendingPaymentId || step !== 'checkout') return;

    const expiryValue = checkoutPaymentRef.current?.payment.expiresAt;
    const parsedExpiry = expiryValue ? Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(expiryValue)
      ? expiryValue : `${expiryValue}+07:00`) : NaN;
    const startedAt = Number.isFinite(parsedExpiry)
      ? parsedExpiry - QR_VALIDITY_SECONDS * 1000
      : Date.now();
    const timers = STATUS_POLL_SECONDS.flatMap((seconds) => {
      const delay = startedAt + seconds * 1000 - Date.now();
      return delay > 0 ? [window.setTimeout(
        () => void refreshPaymentStatus(false, 'scheduled'), delay,
      )] : [];
    });
    if (Number.isFinite(parsedExpiry) && parsedExpiry > Date.now()) {
      timers.push(window.setTimeout(
        () => void refreshPaymentStatus(false, 'final'), parsedExpiry - Date.now(),
      ));
    }
    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [isQrStep, pendingPaymentId, refreshPaymentStatus, step]);

  const confirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setPaymentError('');

    if (isQrStep && checkoutPayment) {
      setPaymentLoading(true);
      await refreshPaymentStatus(true);
      setPaymentLoading(false);
      return;
    }

    if (!backendBookingId) {
      setPaymentError('This payment method is not connected to the backend yet. Please use QR Pay.');
      return;
    }

    setConfirmedBookingId((current) => current || String(backendBookingId));
    setMaxStepIndex(FLOW_STEPS.length - 1);
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paymentReference =
    checkoutPayment?.display.reference ||
    confirmedBookingId ||
    `CIN-${(showtime?.date || '20260821').replace(/-/g, '')}-001234`;
  const paymentQrUrl =
    checkoutPayment?.display.qrImageSrc ||
    `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      `${paymentReference}|${(promotionDiscount > 0 ? discountedTotal : grandTotal).toFixed(2)}|${movie?.title || 'Cinematique'}`,
    )}`;

  const downloadTicket = () => {
    const ticketText = [
      'CINEMATIQUE E-TICKET',
      `Booking Reference: ${confirmedBookingId || paymentReference}`,
      `Movie: ${movie?.title || 'Unknown Movie'}`,
      `Showtime: ${showtime?.cinemaName} - ${showtime?.hallName}`,
      `Date: ${formatDate(showtime?.date || '')} at ${showtime?.time}`,
      `Seats: ${selectedSeats.join(', ')}`,
      `Total: ${formatCurrency(promotionDiscount > 0 ? discountedTotal : grandTotal)}`,
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

  const toggleSeatFilter = (filter: 'ALL' | 'AVAILABLE' | 'SELECTED' | 'OCCUPIED' | 'STANDARD' | 'VIP' | 'COUPLE') => {
    setActiveSeatFilter((prev) => (prev === filter ? 'ALL' : filter));
  };

  const isSeatMatchingFilter = (seatType: string, occupied: boolean, selected: boolean) => {
    if (activeSeatFilter === 'ALL') return true;
    if (activeSeatFilter === 'AVAILABLE') return !occupied && !selected;
    if (activeSeatFilter === 'SELECTED') return selected;
    if (activeSeatFilter === 'OCCUPIED') return occupied;
    if (activeSeatFilter === 'STANDARD') return seatType === 'STANDARD';
    if (activeSeatFilter === 'VIP') return seatType === 'VIP';
    if (activeSeatFilter === 'COUPLE') return seatType === 'COUPLE';
    return true;
  };

  const renderLegend = () => (
    <div className="mb-6 flex items-center justify-center">
      <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-muted border border-border shadow-inner dark:bg-zinc-900/90 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => toggleSeatFilter('ALL')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus:outline-none ${
            activeSeatFilter === 'ALL'
              ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30'
              : 'text-foreground/70 hover:text-foreground hover:bg-muted-foreground/10'
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => toggleSeatFilter('STANDARD')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus:outline-none ${
            activeSeatFilter === 'STANDARD'
              ? 'bg-foreground text-background shadow-md'
              : 'text-foreground/70 hover:text-foreground hover:bg-muted-foreground/10'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-300 shadow-[0_0_6px_rgba(150,150,150,0.6)]" /> Standard
        </button>

        <button
          type="button"
          onClick={() => toggleSeatFilter('VIP')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus:outline-none ${
            activeSeatFilter === 'VIP'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/20'
              : 'text-amber-600/80 dark:text-amber-400/80 hover:text-amber-700 hover:bg-amber-500/10'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" /> VIP
        </button>

        <button
          type="button"
          onClick={() => toggleSeatFilter('COUPLE')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer focus:outline-none ${
            activeSeatFilter === 'COUPLE'
              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/50 shadow-md shadow-rose-500/20'
              : 'text-rose-600/80 dark:text-rose-400/80 hover:text-rose-700 hover:bg-rose-500/10'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" /> Couple
        </button>
      </div>
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
            return (
              <div key={row} className="flex min-w-[500px] items-center justify-center gap-2 sm:gap-3">
                <span className="w-6 text-center text-xs font-bold text-muted-foreground">{row}</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {screenSeats.filter((seat) => seat.rowName === row).map((seat) => {
                    const seatId = seatLabel(seat);
                    const seatType = getSeatType(seatId);
                    const price = getSeatPrice(seatId);
                    const occupied = isSeatOccupied(seatId);
                    const selected = selectedSeats.includes(seatId);
                    const isMatchingFilter = isSeatMatchingFilter(seatType, occupied, selected);

                    let seatClass = 'cursor-pointer border border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-700/50 dark:bg-zinc-800/90 dark:text-zinc-200';
                    if (seatType === 'VIP') {
                      seatClass =
                        'cursor-pointer border border-amber-400 bg-amber-100/90 text-amber-950 font-bold dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300';
                    } else if (seatType === 'COUPLE') {
                      seatClass =
                        'cursor-pointer border border-rose-400 bg-rose-100/90 text-rose-950 font-bold dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300';
                    }

                    if (occupied) {
                      seatClass = 'seat-occupied cursor-not-allowed border border-border bg-muted/60 text-muted-foreground/40 opacity-40';
                    } else if (selected) {
                      seatClass =
                        'scale-105 cursor-pointer border-transparent bg-[#E50914] font-black text-white shadow-lg shadow-[#E50914]/70 ring-2 ring-[#E50914]/50 z-10';
                    }

                    const hoverClass = occupied
                      ? ''
                      : selected
                        ? ''
                        : seatType === 'VIP'
                          ? 'hover:border-amber-500 hover:bg-amber-200 hover:text-amber-950 dark:hover:border-amber-400 dark:hover:bg-amber-900/60 dark:hover:text-amber-200'
                          : seatType === 'COUPLE'
                            ? 'hover:border-rose-500 hover:bg-rose-200 hover:text-rose-950 dark:hover:border-rose-400 dark:hover:bg-rose-900/60 dark:hover:text-rose-200'
                            : 'hover:border-zinc-400 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:border-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white';

                    const dimClass = !isMatchingFilter ? 'opacity-25 blur-[0.2px] transition-all duration-300' : 'opacity-100 transition-all duration-300';

                    return (
                      <motion.button
                        key={seatId}
                        type="button"
                        disabled={occupied}
                        onClick={() => handleSeatClick(seatId)}
                        whileHover={occupied ? {} : { scale: 1.12, y: -2 }}
                        whileTap={occupied ? {} : { scale: 0.92 }}
                        className={`flex h-9 w-9 items-center justify-center rounded-t-lg rounded-b-md text-[11px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${seatClass} ${hoverClass} ${dimClass}`}
                        title={`${seatId} (${seatType} - ${formatCurrency(price)})`}
                        aria-label={`${seatId}, ${occupied ? 'occupied' : selected ? 'selected' : 'available'}, ${seatType}`}
                      >
                        {!occupied && seatId}
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
          {Array.from(new Set(screenSeats.map((seat) => seat.seatType))).map((type) => {
            const typedSeats = screenSeats.filter((seat) => seat.seatType === type);
            const prices = typedSeats.map((seat) => Number(seat.price));
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const isFilterActive = activeSeatFilter === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleSeatFilter(type as 'STANDARD' | 'VIP' | 'COUPLE')}
                className={`rounded-xl p-3 text-left transition-all border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] ${
                  isFilterActive
                    ? type === 'COUPLE'
                      ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold shadow-md shadow-rose-500/20'
                      : type === 'VIP'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold shadow-md shadow-amber-500/20'
                        : 'border-[#E50914] bg-[#E50914]/15 text-[#E50914] font-bold shadow-md shadow-[#E50914]/20'
                    : 'border-border/60 bg-muted hover:border-border hover:bg-muted/80 text-foreground'
                }`}
              >
                <span className="block text-[11px] font-medium text-muted-foreground">
                  {type} · Rows {Array.from(new Set(typedSeats.map((seat) => seat.rowName))).join(', ')}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(min)}{max !== min ? ` – ${formatCurrency(max)}` : ''}
                </span>
              </button>
            );
          })}
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
      category === 'All' ? snacks.length : snacks.filter((snack) => snack.category === category).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter snacks by category">
          {snackCategories.map((category) => {
            const Icon = categoryIcon(category);
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
                    <SnackImage name={snack.name} category={snack.category as 'Popcorn' | 'Drink' | 'Combo' | 'Snacks'} src={snack.imageUrl} />
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
            Seat {seatId} · {getSeatType(seatId)}
          </span>
          <span>{formatCurrency(getSeatPrice(seatId))}</span>
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
      {promotionDiscount > 0 && (
        <div className="flex justify-between text-emerald-400">
          <span>Promotion{promotionCode ? ` (${promotionCode})` : ''}</span>
          <span>-{formatCurrency(promotionDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-3 text-base font-black text-foreground">
        <span>Total Amount</span>
        <span className="text-[#E50914]">{formatCurrency(promotionDiscount > 0 ? discountedTotal : grandTotal)}</span>
      </div>
    </div>
  );

  const renderQrPanel = () => (
    <div className="space-y-2 text-center">
      <div className="flex items-center gap-2 border-b border-border pb-4 text-left">
        <QrCode className="h-5 w-5 text-[#E50914]" />
        <div>
          <h2 className="text-lg font-black uppercase text-foreground">Scan to Pay</h2>
          <p className="text-xs text-muted-foreground">Complete the payment in your banking app. Your booking confirms automatically when payment is received.</p>
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
                <Banknote className="h-5 w-5 text-[#E50914]" />
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
              <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-[#E50914]" />
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">Cash payment</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Confirm your booking now and pay cash at the cinema counter. Your booking will remain pending until staff receives payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <PromoCodeInput
              cartItems={promotionCartItems}
              subtotal={grandTotal}
              onAppliedChange={(code, discountAmount) => {
                setPromotionCode(code);
                setPromotionDiscount(Number(discountAmount || 0));
              }}
            />

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
          onClick={() => void startGatewayPayment('KHQR')}
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
          Check Payment Status <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => void startGatewayPayment('CASH')}
        disabled={paymentLoading || selectedSeats.length === 0}
        className={PRIMARY_CTA}
      >
        {paymentLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Banknote className="h-4 w-4" aria-hidden="true" />
        )}
        Confirm Cash Booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
              <p className="truncate text-base font-black text-foreground tabular-nums">
                {formatCurrency(promotionDiscount > 0 ? discountedTotal : grandTotal)}
              </p>
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

  if (isAuthLoading || needsLogin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border bg-card p-7 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E50914]/10 text-[#E50914]">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAuthLoading ? 'Checking your account' : 'Redirecting to sign in'}
          </h1>
          <p role="status" className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Please sign in before choosing seats or placing an order.
          </p>
        </div>
      </div>
    );
  }

  const unavailable = loadedShow && step !== 'confirmation' ? showUnavailableReason(loadedShow, now) : '';
  if (seatsLoading || seatsError || unavailable || !screenSeats.length) {
    const schedule = loadedShow ? getCinemaDateTime(loadedShow.startTime) : null;
    const anotherShowtimePath = showtime?.cinemaId
      ? `/cinemas?cinema=${encodeURIComponent(showtime.cinemaId)}`
      : '/cinemas';
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div className="rounded-3xl border border-border bg-card p-7 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E50914]/10 text-[#E50914]">
            {seatsLoading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Clock3 className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{seatsLoading ? 'Getting your seats ready' : unavailable ? 'Choose a new showtime' : 'Seat map unavailable'}</h1>
          {!seatsLoading && schedule?.date && (
            <p className="mt-3 text-sm font-medium text-foreground">
              {movie?.title && `${movie.title} · `}{formatDate(`${schedule.date}T12:00:00`)} at {schedule.time}
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Cinema local time (Cambodia)</span>
            </p>
          )}
          <p role={seatsLoading ? 'status' : 'alert'} className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {seatsLoading ? 'Loading seats…' : unavailable || seatsError || 'No seats are configured for this screen yet.'}
          </p>
          {!seatsLoading && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {unavailable || !backendShowId ? (
                <button type="button" onClick={() => navigate(anotherShowtimePath)} className={PRIMARY_CTA}>Choose another showtime <ArrowRight className="h-4 w-4" /></button>
              ) : (
                <>
                  <button type="button" onClick={() => setReloadSeats((value) => value + 1)} className={PRIMARY_CTA}>Reload seat map</button>
                  <button type="button" onClick={() => navigate(anotherShowtimePath)} className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">Choose another showtime</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

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
