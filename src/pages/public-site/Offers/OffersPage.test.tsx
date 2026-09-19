import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OffersPage } from './OffersPage';
import { productService } from '@/services/productService';
import { productCategoryService } from '@/services/productCategoryService';
import type { Product } from '@/types/product';

const auth = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock('@/store/authStore', () => ({ useAuthStore: (selector: (state: typeof auth) => unknown) => selector(auth) }));
vi.mock('@/services/productService', () => ({ productService: { list: vi.fn() } }));
vi.mock('@/services/productCategoryService', () => ({ productCategoryService: { list: vi.fn() } }));

function product(id: number, name: string, price: number, categoryId = 1, overrides: Partial<Product> = {}): Product {
  return { id, name, price, productCategoryId: categoryId, isAvailable: true, stockQuantity: 10, imageUrl: null, imagePublicId: null, createdAt: '', updatedAt: '', ...overrides };
}

function openOffers(route = '/promotion') {
  return render(<MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><OffersPage /></MemoryRouter>);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
  auth.isAuthenticated = true;
  vi.mocked(productService.list).mockResolvedValue([
    product(1, 'Salted popcorn', 4.5),
    product(2, 'Cold cola', 2, 2),
    product(3, 'Sold out popcorn', 5, 1, { stockQuantity: 0 }),
    product(4, 'Unavailable popcorn', 4, 1, { isAvailable: false }),
    product(5, 'Retired combo', 9, 3),
  ]);
  vi.mocked(productCategoryService.list).mockResolvedValue([
    { id: 1, name: 'Popcorn', description: 'Popcorn selection.', isActive: true },
    { id: 2, name: 'Drinks', description: 'Cold drinks.', isActive: true },
    { id: 3, name: 'Combos', description: '', isActive: false },
  ]);
});

describe('Offers and food menu', () => {
  it('lets guests browse the page without making protected API requests or showing fabricated claims', () => {
    auth.isAuthenticated = false;
    openOffers('/fnb');

    expect(screen.getByRole('link', { name: 'Sign in to browse' })).toHaveAttribute('href', '/login?redirect=%2Ffnb');
    expect(screen.getByRole('link', { name: 'Explore showtimes' })).toHaveAttribute('href', '/cinemas');
    expect(productService.list).not.toHaveBeenCalled();
    expect(productCategoryService.list).not.toHaveBeenCalled();
    expect(screen.queryByText(/Claim now|Digital pass|2024/i)).not.toBeInTheDocument();
  });

  it('shows real prices and excludes unavailable stock and inactive categories', async () => {
    openOffers();

    expect(await screen.findByRole('heading', { name: 'Salted popcorn' })).toBeInTheDocument();
    expect(screen.getByText('$4.50')).toBeInTheDocument();
    expect(screen.getByText('$2.00')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText('Sold out popcorn')).not.toBeInTheDocument();
    expect(screen.queryByText('Unavailable popcorn')).not.toBeInTheDocument();
    expect(screen.queryByText('Retired combo')).not.toBeInTheDocument();
    expect(screen.getByText('Online promotions are not available yet')).toBeInTheDocument();
  });

  it('combines category and search filters and sorts by actual price', async () => {
    openOffers();
    await screen.findByRole('heading', { name: 'Salted popcorn' });

    fireEvent.change(screen.getByRole('combobox', { name: 'Sort by' }), { target: { value: 'price-high' } });
    expect(within(screen.getAllByRole('article')[0]).getByRole('heading', { name: 'Salted popcorn' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Drinks' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Cold cola' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search food and drinks' }), { target: { value: 'popcorn' } });
    expect(screen.getByText('No matching snacks or drinks')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show all food & drinks' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('persists the saved shortlist across visits and allows removal from the saved view', async () => {
    const view = openOffers();
    fireEvent.click(await screen.findByRole('button', { name: 'Save Salted popcorn' }));
    expect(JSON.parse(localStorage.getItem('cinematique_saved_menu_items_v1') || '[]')).toEqual([1]);
    view.unmount();
    openOffers();

    fireEvent.click(await screen.findByRole('button', { name: 'Saved (1)' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Salted popcorn' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Unsave Salted popcorn' }));
    expect(screen.getByText('Start your movie-night shortlist')).toBeInTheDocument();
    expect(localStorage.getItem('cinematique_saved_menu_items_v1')).toBe('[]');
  });

  it('recovers from invalid saved data and from a menu request failure', async () => {
    localStorage.setItem('cinematique_saved_menu_items_v1', '{bad-json');
    vi.mocked(productService.list).mockRejectedValueOnce(new Error('Network error'));
    openOffers();

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load the food menu");
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Salted popcorn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saved (0)' })).toBeInTheDocument();
  });

  it('provides a booking path when the catalog has no available products', async () => {
    vi.mocked(productService.list).mockResolvedValue([]);
    openOffers();

    expect(await screen.findByText('The menu is being prepared')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore showtimes' })).toHaveAttribute('href', '/cinemas');
  });
});
