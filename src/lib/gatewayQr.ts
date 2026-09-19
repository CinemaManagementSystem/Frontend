import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr';
import QRCode from 'qrcode';
import type { Payment } from '@/types/payment';

export const QR_VALIDITY_SECONDS = 300;
export const SCAN_CUTOFF_SECONDS = 60;
export const MAX_MANUAL_CHECKS = 2;
export const SCHEDULED_CHECK_SECONDS = [60, 120, 180, 240] as const;

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
  if (!Number.isFinite(backendExpiry)) throw new Error('The payment has no valid expiry. Please return to checkout.');
  return Math.min(startedAt + QR_VALIDITY_SECONDS * 1000, backendExpiry);
}

export function generateGatewayQr(payment: Payment, expiresAt: number) {
  if (!payment.khqrString || !payment.md5Hash) throw new Error('Payment QR data is missing');
  const fields = khqrFields(payment.khqrString);
  const merchant = khqrFields(fields['29'] || '');
  const additional = khqrFields(fields['62'] || '');
  if (!merchant['00'] || !fields['59'] || !fields['60']) throw new Error('Merchant details are missing');
  const response = new BakongKHQR().generateIndividual(new IndividualInfo(
    merchant['00'], fields['59'], fields['60'], {
      currency: fields['53'] === '116' ? khqrData.currency.khr : khqrData.currency.usd,
      amount: Number(payment.amount),
      billNumber: additional['01'],
      storeLabel: additional['03'],
      terminalLabel: additional['07'],
      merchantCategoryCode: fields['52'],
      expirationTimestamp: Math.floor(expiresAt),
    },
  ));
  if (response.status?.code !== 0 || !response.data?.qr || !response.data.md5) throw new Error('Unable to generate KHQR');
  return { qr: response.data.qr, md5: response.data.md5, expectedMd5: payment.md5Hash };
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
