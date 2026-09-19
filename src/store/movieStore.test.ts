import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMovieStore } from './movieStore';
import { movieAdminService } from '@/services/movieAdminService';
import { showService } from '@/services/showService';
import { seatService } from '@/services/seatService';
import { screenService } from '@/services/screenService';
import { theaterService } from '@/services/theaterService';

vi.mock('@/services/movieAdminService', () => ({ movieAdminService: { list: vi.fn() } }));
vi.mock('@/services/showService', () => ({ showService: { list: vi.fn() } }));
vi.mock('@/services/seatService', () => ({ seatService: { list: vi.fn() } }));
vi.mock('@/services/screenService', () => ({ screenService: { list: vi.fn() } }));
vi.mock('@/services/theaterService', () => ({ theaterService: { list: vi.fn() } }));

const upcoming = { id: 4, movieId: 1, screenId: 10, status: 'SCHEDULED', startTime: '2026-09-20T11:00:00Z', endTime: '2026-09-20T13:00:00Z', ticketPrice: 10 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-19T14:00:00Z'));
  localStorage.clear();
  useMovieStore.setState({ movies: [], showtimes: [], loading: false, catalogRequiresSignIn: false });
  vi.mocked(movieAdminService.list).mockResolvedValue([{
    id: 1, title: 'Inception', categoryId: 1, description: '', posterUrl: '', posterPublicId: null,
    genre: 'Sci-fi', language: 'English', durationMinutes: 148, releaseDate: '2010-07-16', status: 'NOW_SHOWING',
  }]);
  vi.mocked(showService.list).mockResolvedValue([
    { ...upcoming, id: 1, status: 'ACTIVE', startTime: '2026-09-17T18:00:00' }, upcoming,
    { ...upcoming, id: 5, status: 'CANCELLED' },
  ]);
  vi.mocked(screenService.list).mockResolvedValue([{ id: 10, name: 'Hall 1', screenType: 'IMAX', status: 'ACTIVE', totalSeats: 100, theaterId: 2 }]);
  vi.mocked(theaterService.list).mockResolvedValue([{ id: 2, name: 'Central Cinema', address: 'Phnom Penh', phone: '', status: 'ACTIVE', locationId: 1, managerId: 1 }]);
  vi.mocked(seatService.list).mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('public movie catalog', () => {
  it('keeps guest movie browsing available without requesting protected screens or seats', async () => {
    await useMovieStore.getState().fetchCatalog();
    expect(useMovieStore.getState().movies[0].title).toBe('Inception');
    expect(useMovieStore.getState().catalogRequiresSignIn).toBe(true);
    expect(screenService.list).not.toHaveBeenCalled();
    expect(seatService.list).not.toHaveBeenCalled();
    expect(useMovieStore.getState().showtimes[0].cinemaId).toBe('');
  });

  it('preserves API status and timestamps while joining actual screen and cinema data', async () => {
    localStorage.setItem('token', 'test-session');
    await useMovieStore.getState().fetchCatalog();
    expect(useMovieStore.getState().showtimes.find((show) => show.id === 'st-4')).toMatchObject({
      startTime: upcoming.startTime, endTime: upcoming.endTime, status: 'SCHEDULED', date: '2026-09-20', time: '18:00',
      cinemaId: 'c-2', cinemaName: 'Central Cinema', hallName: 'Hall 1', format: 'IMAX',
    });
    expect(useMovieStore.getState().getShowtimesByMovieId('m-1').map((show) => show.id)).toEqual(['st-4']);
    expect(useMovieStore.getState().showtimes).toHaveLength(3);
    expect(useMovieStore.getState().catalogRequiresSignIn).toBe(false);
  });

  it('shares one request across concurrently mounted catalog consumers', async () => {
    const first = useMovieStore.getState().fetchCatalog();
    const second = useMovieStore.getState().fetchCatalog();
    expect(first).toBe(second);
    await Promise.all([first, second]);
    expect(showService.list).toHaveBeenCalledTimes(1);
    expect(useMovieStore.getState().loading).toBe(false);
  });

  it('clears the in-flight request after failure so retry can load the catalog', async () => {
    vi.mocked(showService.list).mockRejectedValueOnce(new Error('Temporarily unavailable'));
    await expect(useMovieStore.getState().fetchCatalog()).rejects.toThrow('Temporarily unavailable');
    expect(useMovieStore.getState().loading).toBe(false);
    await useMovieStore.getState().fetchCatalog();
    expect(useMovieStore.getState().movies).toHaveLength(1);
  });
});
