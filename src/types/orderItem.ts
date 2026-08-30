export interface OrderItem {
  id: number;
  quantity: number;
  subtotal: number;
  unitPrice: number;
  orderId: number;
  productId: number;
}

export interface OrderItemInput {
  quantity: number;
  subtotal: number;
  unitPrice: number;
  orderId: number;
  productId: number;
}