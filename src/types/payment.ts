export type PaymentMethod = 'CASH' | 'KHQR';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  khqrString: string | null;
  md5Hash: string | null;
  bookingId: number | null;
  customerId: number;
  orderId: number | null;
  qrCodeUrl?: string | null;
  qrImageUrl?: string | null;
  khqrImageUrl?: string | null;
  qrUrl?: string | null;
  paymentUrl?: string | null;
  qrCode?: string | null;
  qrCodeData?: string | null;
  khqrCode?: string | null;
  bakongQr?: string | null;
}

export interface PaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  customerId: number;
  bookingId: number | null;
  orderId: number | null;
  merchantName?: string;
  accountId?: string;
}
