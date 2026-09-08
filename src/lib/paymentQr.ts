import type { Payment } from '@/types/payment';
import type { PaymentTransaction } from '@/types/paymentTransaction';

export interface PaymentQrDisplay {
  qrImageSrc: string;
  qrPayload: string;
  reference: string;
}

type PaymentLike = Payment & Record<string, unknown>;

const imageKeys = ['qrCodeUrl', 'qrImageUrl', 'khqrImageUrl', 'qrUrl', 'paymentUrl'] as const;
const payloadKeys = ['khqrString', 'qrCode', 'qrCodeData', 'khqrCode', 'bakongQr'] as const;

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function pickFirstString(record: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = getString(record[key]);
    if (value) return value;
  }
  return '';
}

function toQrImageSrc(payloadOrUrl: string): string {
  if (/^(https?:\/\/|data:image\/)/i.test(payloadOrUrl)) return payloadOrUrl;
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payloadOrUrl)}`;
}

export function resolvePaymentQrDisplay(payment: Payment, transactions: PaymentTransaction[] = []): PaymentQrDisplay | null {
  const paymentRecord = payment as PaymentLike;
  const latestTransaction = [...transactions]
    .filter((transaction) => transaction.paymentId === payment.id)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];

  const reference = getString(latestTransaction?.reference) || getString(payment.transactionId) || `PAY-${payment.id}`;
  const imageUrl = pickFirstString(paymentRecord, imageKeys);
  const qrPayload = pickFirstString(paymentRecord, payloadKeys) || imageUrl || reference;

  if (!qrPayload) return null;

  return {
    qrImageSrc: toQrImageSrc(imageUrl || qrPayload),
    qrPayload,
    reference,
  };
}
