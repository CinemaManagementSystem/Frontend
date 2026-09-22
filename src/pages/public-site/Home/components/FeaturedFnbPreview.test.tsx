import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeaturedFnbPreview } from './FeaturedFnbPreview';
import type { FnbItem } from '@/types/product';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createMockItem(id: number, name: string, price: number, overrides: Partial<FnbItem> = {}): FnbItem {
  return {
    id,
    name,
    price,
    stockQuantity: 10,
    isAvailable: true,
    imageUrl: `https://example.com/${name.toLowerCase()}.jpg`,
    imagePublicId: `public_${id}`,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    productCategoryId: 1,
    ...overrides,
  };
}

describe('FeaturedFnbPreview', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when items is empty and not loading', () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedFnbPreview items={[]} loading={false} />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders lightweight 3-card skeleton when loading is true', () => {
    render(
      <MemoryRouter>
        <FeaturedFnbPreview items={[]} loading={true} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    // 3 skeleton cards should be rendered
    const skeletons = screen.getByRole('status', { name: /loading/i }).children;
    expect(skeletons).toHaveLength(3);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders up to 3 cards with image, name, and formatted price', () => {
    const items: FnbItem[] = [
      createMockItem(1, 'Caramel Popcorn', 4.5),
      createMockItem(2, 'Iced Cola', 2.5),
      createMockItem(3, 'Hotdog Combo', 6),
      createMockItem(4, 'Extra Nachos', 5),
    ];

    render(
      <MemoryRouter>
        <FeaturedFnbPreview items={items} loading={false} />
      </MemoryRouter>,
    );

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);

    expect(screen.getByRole('heading', { name: 'Caramel Popcorn' })).toBeInTheDocument();
    expect(screen.getByText('$4.50')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Iced Cola' })).toBeInTheDocument();
    expect(screen.getByText('$2.50')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Hotdog Combo' })).toBeInTheDocument();
    expect(screen.getByText('$6.00')).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Extra Nachos' })).not.toBeInTheDocument();
  });

  it('navigates to /fnb?item=:id when a card is clicked', () => {
    const items: FnbItem[] = [createMockItem(10, 'Jumbo Popcorn', 5.5)];

    render(
      <MemoryRouter>
        <FeaturedFnbPreview items={items} loading={false} />
      </MemoryRouter>,
    );

    const card = screen.getByRole('article', { name: 'Jumbo Popcorn' });
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/fnb?item=10');
  });

  it('navigates to /fnb?item=:id on Enter keydown', () => {
    const items: FnbItem[] = [createMockItem(10, 'Jumbo Popcorn', 5.5)];

    render(
      <MemoryRouter>
        <FeaturedFnbPreview items={items} loading={false} />
      </MemoryRouter>,
    );

    const card = screen.getByRole('article', { name: 'Jumbo Popcorn' });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/fnb?item=10');
  });

  it('navigates to /fnb when "View all food & drinks" button is clicked', () => {
    const items: FnbItem[] = [createMockItem(1, 'Caramel Popcorn', 4.5)];

    render(
      <MemoryRouter>
        <FeaturedFnbPreview items={items} loading={false} />
      </MemoryRouter>,
    );

    const viewAllButton = screen.getByRole('button', { name: /view all/i });
    fireEvent.click(viewAllButton);

    expect(mockNavigate).toHaveBeenCalledWith('/fnb');
  });
});
