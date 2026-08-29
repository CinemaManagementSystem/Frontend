import type { PaymentMethod, PaymentStatus } from '@/types/payment';

export interface PaymentTransaction {
  id: number;
  amount: number;
  status: PaymentStatus;
  transactionType: PaymentMethod;
  reference: string;
  createdAt: string;
  paymentId: number;
  bookingId: number;
  orderId: number;
}

export interface PaymentTransactionInput {
  amount: number;
  transactionType: PaymentMethod;
  reference: string;
  paymentId: number;
  bookingId: number | null;
  orderId: number | null;
}