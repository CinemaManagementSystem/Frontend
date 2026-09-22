import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from './productService';
import { apiClient } from './apiClient';
import type { Product, ProductInput } from '@/types/product';

vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function mockProduct(id: number, name: string, price: number, overrides: Partial<Product> = {}): Product {
  return {
    id,
    name,
    price,
    stockQuantity: 10,
    isAvailable: true,
    imageUrl: null,
    imagePublicId: null,
    createdAt: '',
    updatedAt: '',
    productCategoryId: 1,
    ...overrides,
  };
}

describe('productService.getFeaturedFnbItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters for available and in-stock items and limits to N items', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        mockProduct(1, 'Item 1', 5.0),
        mockProduct(2, 'Unavailable Item', 4.0, { isAvailable: false }),
        mockProduct(3, 'Sold Out Item', 6.0, { stockQuantity: 0 }),
        mockProduct(4, 'Item 4', 3.5),
        mockProduct(5, 'Item 5', 7.0),
        mockProduct(6, 'Item 6', 8.0),
      ],
    });

    const items = await productService.getFeaturedFnbItems(3);

    expect(apiClient.get).toHaveBeenCalledWith('/products');
    expect(items).toHaveLength(3);
    expect(items.map((item) => item.id)).toEqual([1, 4, 5]);
  });

  it('handles default limit of 3', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        mockProduct(1, 'Item 1', 5.0),
        mockProduct(2, 'Item 2', 4.0),
        mockProduct(3, 'Item 3', 6.0),
        mockProduct(4, 'Item 4', 3.5),
      ],
    });

    const items = await productService.getFeaturedFnbItems();
    expect(items).toHaveLength(3);
  });

  it('returns empty array when list is empty', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [],
    });

    const items = await productService.getFeaturedFnbItems(3);
    expect(items).toEqual([]);
  });
});

describe('productService multipart writes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const payload: ProductInput = {
    name: 'Caramel Popcorn',
    price: 4.5,
    stockQuantity: 25,
    isAvailable: true,
    productCategoryId: 2,
  };

  it('creates products with an image file in FormData', async () => {
    const image = new File(['fake-image'], 'popcorn.png', { type: 'image/png' });
    const product = mockProduct(10, payload.name, payload.price);
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: product });

    await productService.create(payload, image);

    expect(apiClient.post).toHaveBeenCalledWith('/products', expect.any(FormData));
    const form = vi.mocked(apiClient.post).mock.calls[0][1] as FormData;
    expect(form.get('name')).toBe(payload.name);
    expect(form.get('price')).toBe(String(payload.price));
    expect(form.get('stockQuantity')).toBe(String(payload.stockQuantity));
    expect(form.get('isAvailable')).toBe(String(payload.isAvailable));
    expect(form.get('productCategoryId')).toBe(String(payload.productCategoryId));
    expect(form.get('image')).toBe(image);
  });

  it('updates products without forcing an image replacement', async () => {
    const product = mockProduct(10, payload.name, payload.price);
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: product });

    await productService.update(product.id, payload, null);

    expect(apiClient.put).toHaveBeenCalledWith(`/products/${product.id}`, expect.any(FormData));
    const form = vi.mocked(apiClient.put).mock.calls[0][1] as FormData;
    expect(form.get('name')).toBe(payload.name);
    expect(form.get('image')).toBeNull();
  });
});
