import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BookingPage } from './BookingPage';
import { showService } from '@/services/showService';
import { seatService } from '@/services/seatService';
import type { Seat } from '@/types/seat';

vi.mock('@/store/movieStore', () => ({ useMovieStore: () => ({
  showtimes: [{ id: 'st-1', movieId: 'm-1', date: '2099-01-01', time: '18:00', cinemaName: 'Cinema', hallName: 'Hall 1', format: '2D' }],
  getMovieById: () => ({ id: 'm-1', title: 'Test Movie', posterUrl: '' }),
  fetchCatalog: fetchCatalog,
}) }));
const { fetchCatalog } = vi.hoisted(() => ({ fetchCatalog: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/store/authStore', () => ({ useAuthStore: () => ({ user: { id: 1, name: 'Test', email: 'test@example.test' } }) }));
vi.mock('@/services/showService', () => ({ showService: { getById: vi.fn() } }));
vi.mock('@/services/seatService', () => ({ seatService: { list: vi.fn() } }));
vi.mock('@/services/productService', () => ({ productService: { list: vi.fn().mockResolvedValue([]) } }));
vi.mock('@/services/productCategoryService', () => ({ productCategoryService: { list: vi.fn().mockResolvedValue([]) } }));

const makeSeat = (id: number, rowName: string, seatNumber: string, price: number, screenId = 10): Seat => ({
  id, rowName, seatNumber, price, screenId, seatType: 'STANDARD', status: 'AVAILABLE',
});
const show = { id: 1, screenId: 10, movieId: 1, status: 'ACTIVE', startTime: '2099-01-01T18:00:00', endTime: '2099-01-01T20:00:00', ticketPrice: 10 };
function openBooking() {
  return render(<MemoryRouter initialEntries={['/booking/st-1?movieId=m-1']}><Routes><Route path="/booking/:showtimeId" element={<BookingPage />} /></Routes></MemoryRouter>);
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.mocked(showService.getById).mockResolvedValue(show);
  vi.mocked(seatService.list).mockResolvedValue([
    makeSeat(1, 'A', 'A1', 0.3), makeSeat(2, 'A', '2', 0.7),
    { ...makeSeat(3, 'D', 'D1', 1), seatType: 'COUPLE' },
    makeSeat(4, 'E', 'E1', 9, 20),
  ]);
});

describe('backend seat map', () => {
  it('only offers actual seats in the exact route show screen, including per-seat prices', async () => {
    openBooking();
    fireEvent.click(await screen.findByRole('button', { name: 'A2, available, STANDARD' }));
    expect(showService.getById).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('button', { name: /^E1,/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^H1,/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'D1, available, COUPLE' })).toBeInTheDocument();
    expect(screen.getByTitle('A2 (STANDARD - $0.70)')).toBeInTheDocument();
    expect(screen.getAllByText('$0.70').length).toBeGreaterThan(0);
  });

  it('does not fabricate seats when the API fails', async () => {
    vi.mocked(seatService.list).mockRejectedValue(new Error('Seat service unavailable'));
    openBooking();
    expect(await screen.findByRole('alert')).toHaveTextContent('Seat service unavailable');
    expect(screen.queryByRole('button', { name: /^A1,/ })).not.toBeInTheDocument();
  });

  it('shows an empty state when no seats belong to the show screen', async () => {
    vi.mocked(seatService.list).mockResolvedValue([makeSeat(4, 'E', 'E1', 9, 20)]);
    openBooking();
    expect(await screen.findByRole('alert')).toHaveTextContent('No seats are configured');
    expect(screen.queryByRole('button', { name: /^E1,/ })).not.toBeInTheDocument();
  });

  it('blocks an expired show instead of selecting a different show for the same movie', async () => {
    vi.mocked(showService.getById).mockResolvedValue({ ...show, startTime: '2000-01-01T18:00:00' });
    openBooking();
    expect(await screen.findByRole('alert')).toHaveTextContent('choose an upcoming showtime');
    expect(screen.queryByRole('button', { name: /^A1,/ })).not.toBeInTheDocument();
  });
});
