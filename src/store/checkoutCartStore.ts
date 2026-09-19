import { create } from 'zustand';
import type { CheckoutOrderLine } from '@/services/checkoutOrderService';

interface CheckoutCartState {
  bookingId: number | null;
  items: CheckoutOrderLine[];
  setCheckout: (bookingId: number, items: CheckoutOrderLine[]) => void;
  clearCheckout: (bookingId: number | null) => void;
}

export const useCheckoutCartStore = create<CheckoutCartState>((set) => ({
  bookingId: null,
  items: [],
  setCheckout: (bookingId, items) => set({ bookingId, items }),
  clearCheckout: (bookingId) => set((current) => current.bookingId === bookingId
    ? { bookingId: null, items: [] } : current),
}));
