import QRCode from 'qrcode';
import type { Payment } from '@/types/payment';

export const QR_VALIDITY_SECONDS = 300;
export const SCAN_CUTOFF_SECONDS = 60;
export const MAX_MANUAL_CHECKS = 2;
export const STATUS_POLL_SECONDS = [60, 120, 180, 240] as const;

const payloadKeys = ['khqrString', 'qrCode', 'qrCodeData', 'khqrCode', 'bakongQr'] as const;
const linkKeys = ['paymentUrl', 'qrCodeUrl', 'qrImageUrl', 'khqrImageUrl', 'qrUrl'] as const;

const clean = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

export function khqrFields(value: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (let index = 0; index < value.length;) {
    const header = value.slice(index, index + 4);
    if (!/^\d{4}$/.test(header)) throw new Error('Invalid KHQR data');
    const tag = header.slice(0, 2);
    const size = Number(header.slice(2));
    index += 4;
    if (tag in fields || index + size > value.length) throw new Error('Invalid KHQR data');
    fields[tag] = value.slice(index, index + size);
    index += size;
  }
  return fields;
}

export function paymentDeadline(payment: Payment, startedAt: number): number {
  // Backend LocalDateTime values represent Cambodia, independent of browser timezone.
  const date = payment.expiresAt;
  const backendExpiry = date ? Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(date) ? date : `${date}+07:00`) : NaN;
  const clientExpiry = startedAt + QR_VALIDITY_SECONDS * 1000;
  return Number.isFinite(backendExpiry) ? Math.min(clientExpiry, backendExpiry) : clientExpiry;
}

export function gatewayQrPayload(payment: Payment): string | null {
  const record = payment as Payment & Record<string, unknown>;
  for (const key of payloadKeys) {
    const value = clean(record[key]);
    if (value) return value;
  }
  return null;
}

export function gatewayFallbackLink(payment: Payment): string | null {
  const record = payment as Payment & Record<string, unknown>;
  for (const key of linkKeys) {
    const value = clean(record[key]);
    if (value) return value;
  }
  const payload = gatewayQrPayload(payment);
  return payload ? `data:text/plain;charset=utf-8,${encodeURIComponent(payload)}` : null;
}

export async function renderGatewayQr(qr: string): Promise<{ src: string; download: string }> {
  // Both image and fallback link stay local; no payment data goes to a QR-image website.
  const svg = await QRCode.toString(qr, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 320 });
  const download = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  try {
    return { src: await QRCode.toDataURL(qr, { width: 320, margin: 4, errorCorrectionLevel: 'M' }), download };
  } catch {
    return { src: download, download };
  }
}
