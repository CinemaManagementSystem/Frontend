import { describe, expect, it } from 'vitest';
import {
  gatewayFallbackLink,
  gatewayQrPayload,
  MAX_MANUAL_CHECKS,
  paymentDeadline,
  QR_VALIDITY_SECONDS,
  STATUS_POLL_SECONDS,
} from './gatewayQr';
import type { Payment } from '@/types/payment';

const payment: Payment = {
  id: 12,
  amount: 24,
  paymentMethod: 'KHQR',
  status: 'PENDING',
  transactionId: null,
  paidAt: null,
  expiresAt: null,
  khqrString: null,
  md5Hash: null,
  bookingId: 8,
  customerId: 3,
  orderId: 4,
  userMembershipId: null,
};

describe('gateway QR helpers', () => {
  it('uses the client five-minute hard cap when the backend expiry is missing', () => {
    const startedAt = Date.UTC(2026, 0, 1, 10, 0, 0);

    expect(paymentDeadline(payment, startedAt)).toBe(startedAt + QR_VALIDITY_SECONDS * 1000);
  });

  it('selects alternate QR payloads before falling back to payment links', () => {
    const withPayload = { ...payment, qrCodeData: '000201010212KHQR' };
    const withLink = { ...payment, paymentUrl: 'https://pay.example.test/session/12' };

    expect(gatewayQrPayload(withPayload)).toBe('000201010212KHQR');
    expect(gatewayFallbackLink(withPayload)).toContain(encodeURIComponent('000201010212KHQR'));
    expect(gatewayFallbackLink(withLink)).toBe('https://pay.example.test/session/12');
  });

  it('uses only the four Bakong polling milestones and two manual checks', () => {
    expect(STATUS_POLL_SECONDS).toEqual([60, 120, 180, 240]);
    expect(MAX_MANUAL_CHECKS).toBe(2);
  });
});
