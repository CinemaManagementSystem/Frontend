import type { Payment } from './payment';
import type { CheckoutOrderLine } from '@/services/checkoutOrderService';

export interface PaymentGatewayState {
  orderId?: number | string | null;
  bookingId?: number | string | null;
  paymentId?: number | string | null;
  totalAmount?: number | string | null;
  paymentMethod?: 'KHQR' | 'ABA_PAY' | 'CASH';
  formData?: { bookingId?: number; customerId?: number; orderNumber?: string; name?: string; email?: string };
  cartItems?: CheckoutOrderLine[];
}

export interface GatewaySession {
  payment: Payment;
  startedAt: number;
  expiresAt: number;
  manualChecks: number;
  storageKey: string;
}
