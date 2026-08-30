export interface Order {
  id: number;
  orderNumber: string;
  orderType: string;
  status: string;
  orderedAt: string;
  completedAt: string;
  subtotal: number;
  totalAmount: number;
  bookingId: number;
  customerId: number;
}

export interface OrderInput {
  orderNumber: string;
  orderType: string;
  status: string;
  orderedAt: string;
  completedAt: string;
  subtotal: number;
  totalAmount: number;
  bookingId: number;
  customerId: number;
}