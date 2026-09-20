import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, ArrowLeft, Banknote, CheckCircle2, Clock3, Download, LoaderCircle, LockKeyhole, QrCode, RefreshCw, Ticket } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCheckoutCartStore } from '@/store/checkoutCartStore';
import { initializeGateway } from '@/services/paymentGatewayService';
import { getApiErrorMessage } from '@/services/apiClient';
import { MAX_MANUAL_CHECKS, renderGatewayQr } from '@/lib/gatewayQr';
import { usePaymentSession } from '@/hooks/usePaymentSession';
import type { GatewaySession, PaymentGatewayState } from '@/types/paymentGateway';
import { formatCurrency } from '@/utils/formatCurrency';

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background';

export function PaymentGatewayPage() {
  const location = useLocation();
  const { bookingId: routeBookingId } = useParams<{ bookingId: string }>();
  const user = useAuthStore((store) => store.user);
  if (!user) return (
    <main className="mx-auto max-w-xl space-y-5 px-6 py-20 text-center">
      <h1 className="text-2xl font-bold">Sign in to complete checkout</h1>
      <Link to="/login" className={`inline-block rounded-xl bg-primary px-6 py-3 text-primary-foreground ${focus}`}>Sign in</Link>
    </main>
  );
  const routerState = (location.state ?? {}) as PaymentGatewayState;
  const state: PaymentGatewayState = {
    ...routerState,
    // The URL is the recovery source after a browser refresh; router state is
    // still used for the initial checkout so existing links keep working.
    bookingId: routerState.bookingId ?? routeBookingId,
  };
  return <GatewayLoader key={`${location.key}:${user.id}:${state.bookingId ?? ''}`} state={state} customerId={user.id} />;
}

function GatewayLoader({ state, customerId }: { state: PaymentGatewayState; customerId: number }) {
  const [session, setSession] = useState<GatewaySession | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const initialization = useRef<Promise<GatewaySession> | null>(null);

  useEffect(() => {
    let active = true;
    // StrictMode's effect replay subscribes to the same request.
    initialization.current ??= initializeGateway(state, customerId);
    initialization.current.then((result) => { if (active) setSession(result); })
      .catch((reason) => { if (active) setError(getApiErrorMessage(reason, 'checkout')); });
    return () => { active = false; };
  }, [attempt, customerId, state]);

  if (session) return <GatewayCheckout session={session} />;
  return (
    <main className="mx-auto max-w-xl space-y-5 px-6 py-20 text-center">
      {error ? <>
        <AlertTriangle className="mx-auto h-9 w-9 text-amber-500" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Unable to open payment</h1>
        <p role="alert" className="text-muted-foreground">{error}</p>
        <button type="button" className={`rounded-xl bg-primary px-6 py-3 text-primary-foreground ${focus}`} onClick={() => {
          initialization.current = null; setError(''); setAttempt((value) => value + 1);
        }}>Try again</button>
        <Link className={`block rounded text-sm underline ${focus}`} to="/history">View your bookings</Link>
      </> : <p role="status" className="flex items-center justify-center gap-3"><LoaderCircle className="h-6 w-6 motion-safe:animate-spin" aria-hidden="true" /> Preparing your payment...</p>}
    </main>
  );
}

function GatewayCheckout({ session }: { session: GatewaySession }) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const checkout = usePaymentSession(session);
  const { payment, phase, remaining, scanningClosed, busy, manualChecks, message } = checkout;
  const [qrImage, setQrImage] = useState<{ src: string; download: string } | null>(null);
  const [qrError, setQrError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (payment.khqrString && payment.paymentMethod === 'KHQR') {
      renderGatewayQr(payment.khqrString).then((image) => { if (active) setQrImage(image); })
        .catch(() => { if (active) setQrError('The QR image could not be displayed. Return to checkout or choose cash.'); });
    }
    return () => { active = false; };
  }, [payment.khqrString, payment.paymentMethod]);

  useEffect(() => {
    if (phase !== 'paid' && phase !== 'cash') return;
    useCheckoutCartStore.getState().clearCheckout(payment.bookingId);
    const timer = window.setTimeout(() => navigate(`/order-confirmation?paymentId=${payment.id}`, {
      replace: true, state: { paymentId: payment.id, orderId: payment.orderId, bookingId: payment.bookingId },
    }), phase === 'paid' ? 1500 : 0);
    return () => window.clearTimeout(timer);
  }, [navigate, payment.bookingId, payment.id, payment.orderId, phase]);

  const time = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`;
  const closed = !['waiting', 'finalizing'].includes(phase);
  const overlayTitle = phase === 'paid' ? 'Payment received' : phase === 'finalizing' ? 'Final payment check'
    : closed ? 'QR session closed' : 'Scanning closed';
  const status = phase === 'paid' ? 'Paid' : phase === 'cash' ? 'Cash pending'
    : phase === 'finalizing' ? 'Verifying payment' : closed ? 'Session ended' : 'Awaiting payment';

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link to="/history" className={`mb-8 inline-flex items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground ${focus}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Your bookings
        </Link>
        <motion.section initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5 sm:px-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary">
              <Ticket className="h-5 w-5" aria-hidden="true" /> Cinematique / checkout
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Bank-verified payment</span>
          </header>
          <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">One scan. Then the show.</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Open Bakong, ABA, or another KHQR banking app. Check the merchant and amount before approving payment.</p>
              <div className="mx-auto mt-7 max-w-[320px]">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                  {qrImage && !imageFailed ? <img src={qrImage.src} alt="KHQR payment code" onError={() => setImageFailed(true)} className="h-full w-full" />
                    : <div role="status" className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-zinc-700">
                      {qrError || imageFailed ? <><QrCode className="h-8 w-8" aria-hidden="true" />{qrError || 'Use the QR download below.'}</>
                        : <><LoaderCircle className="h-7 w-7 motion-safe:animate-spin" aria-hidden="true" /> Loading QR...</>}
                    </div>}
                  {!scanningClosed && qrImage && !imageFailed && !reducedMotion && <motion.div aria-hidden="true"
                    animate={{ y: [0, 255, 0], opacity: [0.2, 0.65, 0.2] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-x-6 top-7 h-px bg-red-500 shadow-[0_0_8px_1px_rgba(229,9,20,.3)]" />}
                  <AnimatePresence>{scanningClosed && <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-7 text-center text-zinc-100">
                    {phase === 'paid' ? <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-400" aria-hidden="true" /> : <Clock3 className="mb-4 h-9 w-9 text-amber-400" aria-hidden="true" />}
                    <p className="text-xl font-bold">{overlayTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{phase === 'paid' ? 'Opening your confirmation...'
                      : phase === 'finalizing' ? 'Checking your bank one last time.'
                        : closed ? 'Check your booking history before making another payment.' : 'Already paid? Keep this page open. We are still checking.'}</p>
                  </motion.div>}</AnimatePresence>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" aria-hidden="true" /> Session remaining</span>
                  <span role="timer" aria-label="Payment session remaining" className={`font-mono text-xl font-bold tabular-nums ${scanningClosed ? 'text-amber-500' : ''}`}>{time}</span>
                </div>
                {qrImage && !scanningClosed && <a href={qrImage.download} download={`cinema-payment-${payment.id}.svg`}
                  className={`mt-3 inline-flex items-center gap-2 rounded text-xs text-muted-foreground underline underline-offset-4 ${focus}`}>
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download QR / fallback link
                </a>}
                <p className="mt-3 text-xs leading-5 text-muted-foreground">Scanning closes during the final minute so your bank has time to confirm.</p>
              </div>
            </div>
            <aside className="border-t border-dashed border-border bg-muted/30 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">Your ticket to the movies</p>
              <p className="mt-7 text-sm text-muted-foreground">Total to pay</p>
              <p className="mt-1 text-4xl font-black tracking-tight tabular-nums">{formatCurrency(Number(payment.amount))}</p>
              <dl className="my-7 space-y-4 border-y border-border py-6 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Method</dt><dd className="font-semibold">{payment.paymentMethod}</dd></div>
                {payment.orderId && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Order</dt><dd className="font-mono">#{payment.orderId}</dd></div>}
                {payment.bookingId && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Booking</dt><dd className="font-mono">#{payment.bookingId}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Status</dt><dd className="text-right font-semibold">{status}</dd></div>
              </dl>
              <p role="status" aria-live="polite" className="min-h-12 text-sm leading-6 text-muted-foreground">{busy ? 'Checking payment...' : message}</p>
              <button type="button" onClick={() => void checkout.manualCheck()}
                disabled={busy || phase !== 'waiting' || manualChecks >= MAX_MANUAL_CHECKS}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45 ${focus}`}>
                <RefreshCw className={`h-4 w-4 ${busy ? 'motion-safe:animate-spin' : ''}`} aria-hidden="true" /> Check payment ({Math.max(0, MAX_MANUAL_CHECKS - manualChecks)} left)
              </button>
              <button type="button" onClick={() => void checkout.switchToCash()}
                disabled={busy || !['waiting', 'expired', 'unverified'].includes(phase)}
                className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-45 ${focus}`}>
                <Banknote className="h-4 w-4" aria-hidden="true" /> Switch to cash
              </button>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Cash is collected at the cinema counter. Your booking remains pending until staff receives payment.</p>
              <Link to="/history" className={`mt-6 block rounded text-center text-xs underline underline-offset-4 ${focus}`}>View payment in booking history</Link>
            </aside>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
