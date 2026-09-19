import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Home, LoaderCircle, Ticket } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { paymentService } from '@/services/paymentService';
import { getApiErrorMessage } from '@/services/apiClient';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Payment } from '@/types/payment';

export function OrderConfirmationPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const id = Number(params.get('paymentId') || (location.state as { paymentId?: number } | null)?.paymentId);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setPayment(null);
    setError('');
    if (!Number.isSafeInteger(id) || id <= 0) setError('Open a payment from your booking history to view its confirmation.');
    else paymentService.getById(id).then((result) => { if (active) setPayment(result); })
      .catch((reason) => { if (active) setError(getApiErrorMessage(reason, 'payment')); });
    return () => { active = false; };
  }, [id]);
  const paid = payment?.status === 'PAID';
  const cash = payment?.paymentMethod === 'CASH' && payment.status === 'PENDING';
  const title = error ? 'Confirmation unavailable' : paid ? 'Payment successful' : cash ? 'Cash payment pending' : 'Payment not confirmed';

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6">
      <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-7 text-center shadow-xl sm:p-10">
        {!payment && !error ? <p role="status" className="flex items-center justify-center gap-3"><LoaderCircle className="h-6 w-6 motion-safe:animate-spin" /> Checking your confirmation...</p> : <>
          {paid ? <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" aria-hidden="true" />
            : cash ? <Clock3 className="mx-auto h-16 w-16 text-amber-500" aria-hidden="true" />
              : <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" aria-hidden="true" />}
          <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-primary">Cinematique / confirmation</p>
          <h1 className="mt-3 text-3xl font-black">{title}</h1>
          <p role={error ? 'alert' : 'status'} className="mt-4 text-sm leading-6 text-muted-foreground">{error || (paid
            ? 'Your payment has been verified. Your booking is ready in your history.'
            : cash ? 'Pay at the cinema counter before your seat hold expires. Staff will confirm the booking after receiving cash.'
              : 'Your payment is not confirmed yet. Check your bank and booking history before paying again.')}</p>
          {payment && <dl className="mt-7 space-y-3 rounded-2xl border border-border bg-muted/40 p-4 text-left text-sm">
            {payment.bookingId && <div className="flex justify-between"><dt>Booking</dt><dd>#{payment.bookingId}</dd></div>}
            {payment.orderId && <div className="flex justify-between"><dt>Order</dt><dd>#{payment.orderId}</dd></div>}
            <div className="flex justify-between"><dt>Amount</dt><dd className="font-bold">{formatCurrency(Number(payment.amount))}</dd></div>
            <div className="flex justify-between"><dt>Method / status</dt><dd>{payment.paymentMethod} / {payment.status}</dd></div>
          </dl>}
        </>}
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link to="/history" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><Ticket className="h-4 w-4" /> View bookings</Link>
          <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><Home className="h-4 w-4" /> Back home</Link>
        </div>
      </section>
    </main>
  );
}
