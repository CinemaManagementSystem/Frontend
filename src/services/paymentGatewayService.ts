import { bookingAdminService } from './bookingAdminService';
import { orderService } from './orderService';
import { paymentService } from './paymentService';
import { syncCheckoutOrder } from './checkoutOrderService';
import { generateGatewayQr, paymentDeadline } from '@/lib/gatewayQr';
import type { GatewaySession, PaymentGatewayState } from '@/types/paymentGateway';

export function gatewayId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid checkout reference. Please return to checkout.');
  return id;
}

export function saveGatewaySession(session: GatewaySession): void {
  try {
    sessionStorage.setItem(session.storageKey, JSON.stringify({
      paymentId: session.payment.id, startedAt: session.startedAt, expiresAt: session.expiresAt,
      manualChecks: session.manualChecks,
    }));
  } catch { /* Storage can be disabled; the server still enforces expiry and ownership. */ }
}

export async function initializeGateway(state: PaymentGatewayState, customerId: number): Promise<GatewaySession> {
  let orderId = gatewayId(state.orderId);
  const order = orderId ? await orderService.getById(orderId) : null;
  const bookingId = gatewayId(state.bookingId ?? state.formData?.bookingId ?? order?.bookingId);
  const paymentId = gatewayId(state.paymentId);
  if (!bookingId && !orderId && !paymentId) throw new Error('Select your show and seats before opening payment.');
  if (order && order.customerId !== customerId) throw new Error('This order belongs to a different customer.');
  const booking = bookingId ? await bookingAdminService.getById(bookingId) : null;
  if (booking && booking.customerId !== customerId) throw new Error('This booking belongs to a different customer.');
  if (order && order.bookingId !== bookingId) throw new Error('Order and booking do not match.');

  const storageKey = `cinema-payment:${customerId}:${bookingId ? `booking-${bookingId}` : `order-${orderId ?? paymentId}`}`;
  let saved: Partial<{ paymentId: number; startedAt: number; expiresAt: number; manualChecks: number }> = {};
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch { /* Ignore corrupt session data. */ }
  const method = state.paymentMethod === 'CASH' ? 'CASH' : 'KHQR';
  if (state.paymentMethod && !['KHQR', 'ABA_PAY', 'CASH'].includes(state.paymentMethod)) throw new Error('Unsupported payment method');

  let payment = paymentId || saved.paymentId ? await paymentService.getById(paymentId ?? saved.paymentId!) : null;
  if (!payment) {
    // Reconcile an earlier committed POST whose response may have been lost.
    payment = (await paymentService.list()).filter((candidate) =>
      candidate.customerId === customerId && candidate.bookingId === bookingId && candidate.orderId === orderId
      && (candidate.status === 'PENDING' || candidate.status === 'PAID'),
    ).sort((a, b) => b.id - a.id)[0] ?? null;
  }
  if (!payment) {
    if (booking && booking.status !== 'PENDING') throw new Error('This booking is no longer awaiting payment.');
    if (!orderId && state.cartItems?.length) {
      if (!bookingId) throw new Error('Concessions require a seat booking.');
      const orderNumber = state.formData?.orderNumber || `WEB-BOOKING-${bookingId}`;
      orderId = await syncCheckoutOrder({ id: null, orderNumber }, bookingId, customerId, state.cartItems);
    }
    const savedOrder = orderId ? await orderService.getById(orderId) : null;
    const freshBooking = bookingId ? await bookingAdminService.getById(bookingId) : null;
    const backendAmount = Number((Number(freshBooking?.totalAmount || 0) + Number(savedOrder?.totalAmount || 0)).toFixed(2));
    const requestedAmount = state.totalAmount == null ? backendAmount : Number(Number(state.totalAmount).toFixed(2));
    const amount = state.promotionCode ? requestedAmount : backendAmount;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Your checkout has no payable items.');
    if (!state.promotionCode && state.totalAmount != null && Math.round(Number(state.totalAmount) * 100) !== Math.round(backendAmount * 100)) {
      throw new Error('Prices have changed. Return to checkout to review the total.');
    }
    payment = await paymentService.create({ amount, paymentMethod: method, customerId, bookingId, orderId });
  }
  if (payment.customerId !== customerId || (bookingId && payment.bookingId !== bookingId)
      || (orderId && payment.orderId !== orderId)
      || (state.userMembershipId && payment.userMembershipId !== state.userMembershipId)) {
    throw new Error('Payment does not match this checkout.');
  }

  const resumed = saved.paymentId === payment.id && Number.isFinite(saved.startedAt);
  const startedAt = resumed ? Number(saved.startedAt) : Date.now();
  let expiresAt = payment.paymentMethod === 'KHQR' ? paymentDeadline(payment, startedAt) : startedAt;
  if (resumed && Number.isFinite(saved.expiresAt)) expiresAt = Math.min(expiresAt, Number(saved.expiresAt));
  const session: GatewaySession = { payment, startedAt, expiresAt, storageKey,
    manualChecks: resumed ? Math.max(0, Math.min(2, Number(saved.manualChecks) || 0)) : 0,
    returnTo: state.returnTo ?? (payment.userMembershipId ? '/my-membership' : null) };
  saveGatewaySession(session);
  if (!resumed && payment.status === 'PENDING' && payment.paymentMethod === 'KHQR' && expiresAt > Date.now()) {
    try {
      const generated = generateGatewayQr(payment, expiresAt);
      session.payment = await paymentService.prepareKhqr(payment.id, generated);
    } catch {
      // Use the persisted backend code if SDK generation fails. Re-read in case
      // preparation committed but its response was lost. Never display an unbound code.
      session.payment = await paymentService.getById(payment.id);
    }
  }
  saveGatewaySession(session);
  return session;
}
