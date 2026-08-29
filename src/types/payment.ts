export type PaymentMethod = 'CASH' | 'KHQR';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Payment {
  id: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  paidAt: string;
  expiresAt: string;
  khqrString: string;
  md5Hash: string;
  bookingId: number;
  customerId: number;
  orderId: number;
}

export interface PaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  customerId: number;
  bookingId: number | null;
  orderId: number | null;
}