import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncCheckoutOrder, type CheckoutOrderDraft } from './checkoutOrderService';
import { orderService } from './orderService';
import { orderItemService } from './orderItemService';
import type { OrderItem, OrderItemInput } from '@/types/orderItem';

vi.mock('./orderService', () => ({ orderService: { list: vi.fn(), create: vi.fn() } }));
vi.mock('./orderItemService', () => ({
  orderItemService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const lines = [
  { productId: 2, quantity: 1, unitPrice: 0.3 },
  { productId: 3, quantity: 1, unitPrice: 0.3 },
];
let saved: OrderItem[];
let draft: CheckoutOrderDraft;

beforeEach(() => {
  vi.resetAllMocks();
  saved = [];
  draft = { id: null, orderNumber: 'ORDER-test' };
  vi.mocked(orderService.list).mockResolvedValue([]);
  vi.mocked(orderService.create).mockResolvedValue({
    id: 10, orderNumber: draft.orderNumber, bookingId: 4, customerId: 5,
    orderType: 'FOOD', status: 'PENDING', orderedAt: '', completedAt: '', subtotal: 0, totalAmount: 0,
  });
  vi.mocked(orderItemService.list).mockImplementation(async () => [...saved]);
});

function save(input: OrderItemInput) {
  const item = { ...input, id: saved.length + 1 };
  saved.push(item);
  return item;
}

describe('checkout order writes', () => {
  it('waits for each shared-order transaction to finish before starting the next', async () => {
    let active = false;
    vi.mocked(orderItemService.create).mockImplementation(async (input) => {
      if (active) throw new Error('Deadlock: overlapping order writes');
      active = true;
      await new Promise((resolve) => setTimeout(resolve, 5));
      active = false;
      return save(input);
    });
    expect(await syncCheckoutOrder(draft, 4, 5, lines)).toBe(10);
    expect(saved.map((item) => item.productId)).toEqual([2, 3]);
  });

  it('resumes a partially saved order without duplicating the order or its first item', async () => {
    vi.mocked(orderItemService.create)
      .mockImplementationOnce(async (input) => save(input))
      .mockRejectedValueOnce(new Error('Deadlock found'));
    await expect(syncCheckoutOrder(draft, 4, 5, lines)).rejects.toThrow('Deadlock');
    expect(draft.id).toBe(10);
    expect(saved).toHaveLength(1);
    vi.mocked(orderItemService.create).mockImplementation(async (input) => save(input));
    await syncCheckoutOrder(draft, 4, 5, lines);
    expect(orderService.create).toHaveBeenCalledTimes(1);
    expect(saved.map((item) => item.productId)).toEqual([2, 3]);
  });

  it('reconciles a committed item whose HTTP response was lost', async () => {
    vi.mocked(orderItemService.create).mockImplementationOnce(async (input) => {
      save(input);
      throw new Error('Connection lost');
    });
    await expect(syncCheckoutOrder(draft, 4, 5, lines)).rejects.toThrow('Connection lost');
    vi.mocked(orderItemService.create).mockImplementation(async (input) => save(input));
    await syncCheckoutOrder(draft, 4, 5, lines);
    expect(saved.map((item) => item.productId)).toEqual([2, 3]);
  });

  it('reuses saved lines after payment failure and updates changed quantities', async () => {
    vi.mocked(orderItemService.create).mockImplementation(async (input) => save(input));
    await syncCheckoutOrder(draft, 4, 5, lines);
    await syncCheckoutOrder(draft, 4, 5, lines);
    expect(orderItemService.create).toHaveBeenCalledTimes(2);
    await syncCheckoutOrder(draft, 4, 5, [{ ...lines[0], quantity: 2 }]);
    expect(orderItemService.remove).toHaveBeenCalledWith(2);
    expect(orderItemService.update).toHaveBeenCalledWith(1, expect.objectContaining({ quantity: 2, orderId: 10 }));
  });
});
