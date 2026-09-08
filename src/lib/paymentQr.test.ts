import { describe, expect, it } from 'vitest';
import { resolvePaymentQrDisplay } from './paymentQr';
import type { Payment } from '@/types/payment';
import type { PaymentTransaction } from '@/types/paymentTransaction';

const basePayment: Payment = {
  id: 7,
  amount: 38,
  paymentMethod: 'KHQR',
  status: 'PENDING',
  transactionId: 'TXN-KHQR-OLD',
  paidAt: null,
  expiresAt: null,
  khqrString: null,
  md5Hash: null,
  bookingId: 4,
  customerId: 2,
  orderId: null,
};

describe('resolvePaymentQrDisplay', () => {
  it('builds a QR image from the backend khqrString and latest transaction reference', () => {
    const transactions: PaymentTransaction[] = [
      { id: 1, amount: 38, status: 'PENDING', transactionType: 'KHQR', reference: 'TXN-OLD', createdAt: '2026-01-01T10:00:00', paymentId: 7, bookingId: 4, orderId: null },
      { id: 2, amount: 38, status: 'PENDING', transactionType: 'KHQR', reference: 'TXN-NEW', createdAt: '2026-01-01T10:01:00', paymentId: 7, bookingId: 4, orderId: null },
    ];

    const result = resolvePaymentQrDisplay({ ...basePayment, khqrString: '000201010212KHQR' }, transactions);

    expect(result?.reference).toBe('TXN-NEW');
    expect(result?.qrPayload).toBe('000201010212KHQR');
    expect(result?.qrImageSrc).toContain(encodeURIComponent('000201010212KHQR'));
  });

  it('uses a backend QR image URL when the API provides one', () => {
    const result = resolvePaymentQrDisplay({ ...basePayment, qrCodeUrl: 'https://example.test/qr.png' });

    expect(result?.qrImageSrc).toBe('https://example.test/qr.png');
  });

  it('falls back to the transaction id when the payment response has no QR payload', () => {
    const result = resolvePaymentQrDisplay(basePayment);

    expect(result?.qrPayload).toBe('TXN-KHQR-OLD');
    expect(result?.qrImageSrc).toContain(encodeURIComponent('TXN-KHQR-OLD'));
  });
});
