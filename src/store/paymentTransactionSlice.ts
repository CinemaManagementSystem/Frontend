import { createCrudResource, createResourceHook } from './crudSlice';
import { paymentTransactionService } from '@/services/paymentTransactionService';
import type { PaymentTransaction, PaymentTransactionInput } from '@/types/paymentTransaction';
import type { RootState } from '@/app/store';

export const {
  slice: paymentTransactionSlice,
  fetchAll: fetchPaymentTransactions,
  create: createPaymentTransaction,
  update: updatePaymentTransaction,
  remove: removePaymentTransaction,
} = createCrudResource<PaymentTransaction, PaymentTransactionInput>(
  'paymentTransaction',
  paymentTransactionService,
);

export const usePaymentTransactionsResource = createResourceHook<PaymentTransaction, PaymentTransactionInput>(
  (state: RootState) => state.paymentTransaction,
  {
    fetchAll: fetchPaymentTransactions,
    create: createPaymentTransaction,
    update: updatePaymentTransaction,
    remove: removePaymentTransaction,
  },
);

export const paymentTransactionReducer = paymentTransactionSlice.reducer;