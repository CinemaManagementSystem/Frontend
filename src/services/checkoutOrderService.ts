import { orderService } from './orderService';
import { orderItemService } from './orderItemService';

export interface CheckoutOrderDraft {
  id: number | null;
  orderNumber: string;
}

export interface CheckoutOrderLine {
  productId: number;
  quantity: number;
  unitPrice: number;
}

// These writes all recalculate the same booking/order totals. Never parallelize
// them. Re-read saved lines on retry, including after a lost HTTP response.
export async function syncCheckoutOrder(
  draft: CheckoutOrderDraft,
  bookingId: number,
  customerId: number,
  lines: CheckoutOrderLine[],
): Promise<number | null> {
  if (!draft.id && !lines.length) return null;
  if (!draft.id) {
    const existing = (await orderService.list()).find((order) =>
      order.orderNumber === draft.orderNumber && order.bookingId === bookingId && order.customerId === customerId,
    );
    if (existing) draft.id = existing.id;
    else {
      const total = Number(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0).toFixed(2));
      const now = new Date().toISOString().slice(0, 19);
      const order = await orderService.create({
        orderNumber: draft.orderNumber, orderType: 'FOOD', status: 'PENDING',
        orderedAt: now, completedAt: now, subtotal: total, totalAmount: total,
        bookingId, customerId,
      });
      // Persist before the first item write so a failed line can resume this order.
      draft.id = order.id;
    }
  }

  const orderId = draft.id;
  const saved = (await orderItemService.list()).filter((item) => item.orderId === orderId);
  for (const item of saved) {
    if (!lines.some((line) => line.productId === item.productId)) await orderItemService.remove(item.id);
  }
  for (const line of lines) {
    const existing = saved.find((item) => item.productId === line.productId);
    const payload = { ...line, orderId, subtotal: Number((line.unitPrice * line.quantity).toFixed(2)) };
    if (!existing) await orderItemService.create(payload);
    else if (existing.quantity !== line.quantity) await orderItemService.update(existing.id, payload);
  }
  return lines.length ? orderId : null;
}
