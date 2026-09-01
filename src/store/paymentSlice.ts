import { createCrudResource, createResourceHook } from './crudSlice';
import { paymentService } from '@/services/paymentService';
import type { Payment, PaymentInput } from '@/types/payment';
import type { RootState } from '@/app/store';

export const {
  slice: paymentSlice,
  fetchAll: fetchPayments,
  create: createPayment,
  update: updatePayment,
  remove: removePayment,
} = createCrudResource<Payment, PaymentInput>('payment', paymentService);

export const usePaymentsResource = createResourceHook<Payment, PaymentInput>(
  (state: RootState) => state.payment,
  { fetchAll: fetchPayments, create: createPayment, update: updatePayment, remove: removePayment },
);

export const paymentReducer = paymentSlice.reducer;