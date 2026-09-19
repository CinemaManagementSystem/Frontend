import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { CinemasPage } from './CinemasPage';
import { useCinemaStore, type CinemaLocation } from '@/store/cinemaStore';
import { useMovieStore } from '@/store/movieStore';
import type { Movie, Showtime } from '@/types/movie';

const fetchCatalog = vi.fn().mockResolvedValue(undefined);
const fetchCinemas = vi.fn().mockResolvedValue(undefined);

const cinemas: CinemaLocation[] = [
  {
    id: 'c-1', theaterId: 1, name: 'Central Cinema', address: 'Level 3, Central Mall', phone: '023-888-999',
    status: 'OPEN', locationId: 1, locationName: 'Central Mall', city: 'Phnom Penh',
    googleMapsUrl: 'https://maps.google.com/?q=11.55,104.92', latitude: 11.55, longitude: 104.92,
  },
  {
    id: 'c-2', theaterId: 2, name: 'Riverside Cinema', address: 'Riverside Walkway', phone: '063-555-444',
    status: 'OPEN', locationId: 2, locationName: 'Riverside', city: 'Siem Reap',
    googleMapsUrl: null, latitude: null, longitude: null,
  },
  {
    id: 'c-3', theaterId: 3, name: 'Closed Cinema', address: 'North Street', phone: '',
    status: 'CLOSED', locationId: 3, locationName: 'North', city: 'Phnom Penh',
    googleMapsUrl: null, latitude: null, longitude: null,
  },
];

const makeMovie = (id: string, title: string, genres: string[]): Movie => ({
  id, title, genres, slug: title.toLowerCase(), description: '', posterUrl: '', backdropUrl: '',
  rating: 8, voteCount: 1, durationMinutes: 140, releaseDate: '2026-09-01', director: '', cast: [],
  status: 'NOW_SHOWING', price: 5,
});

const makeShow = (id: string, movieId: string, cinemaId: string, time: string, overrides: Partial<Showtime> = {}): Showtime => ({
  id, movieId, cinemaId, cinemaName: cinemas.find((cinema) => cinema.id === cinemaId)!.name,
  hallName: 'Hall 1', startTime: `2026-09-20T${time}:00`, endTime: '2026-09-20T23:00:00',
  date: '2026-09-20', time, status: 'ACTIVE', format: '2D', price: 5, vipPrice: 8, occupiedSeats: [], ...overrides,
});

const shows = [
  makeShow('st-past', 'm-1', 'c-1', '18:00', { date: '2026-09-17', startTime: '2026-09-17T18:00:00' }),
  makeShow('st-morning', 'm-1', 'c-1', '10:00'),
  makeShow('st-evening', 'm-1', 'c-2', '18:00'),
  makeShow('st-afternoon', 'm-2', 'c-1', '14:00', { format: 'IMAX' }),
  makeShow('st-night', 'm-2', 'c-2', '20:00', { format: 'IMAX' }),
  makeShow('st-closed-cinema', 'm-1', 'c-3', '19:00'),
  makeShow('st-cancelled', 'm-1', 'c-1', '11:00', { status: 'CANCELLED' }),
];

function RouteLocation() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}{location.search}</output>;
}

function renderCinemas(path = '/cinemas') {
  return render(<MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <CinemasPage /><RouteLocation />
  </MemoryRouter>);
}

async function openCinemas(path = '/cinemas') {
  renderCinemas(path);
  await screen.findAllByRole('button', { name: /^Book / });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-19T08:00:00+07:00'));
  vi.clearAllMocks();
  localStorage.clear();
  // Keep the real store contracts and subscriptions; replace only network actions.
  useCinemaStore.setState({
    ...useCinemaStore.getInitialState(), cinemas, loaded: true, selectedCinemaId: 'ALL', fetchCinemas,
  });
  useMovieStore.setState({
    ...useMovieStore.getInitialState(), fetchCatalog,
    movies: [makeMovie('m-1', 'Inception', ['Thriller']), makeMovie('m-2', 'Interstellar', ['Sci-Fi'])],
    showtimes: shows,
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('cinema discovery and screening selection', () => {
  it('defaults to the next available date and never offers expired ACTIVE, cancelled, or closed-cinema screenings', async () => {
    await openCinemas();
    expect(screen.getByRole('button', { name: 'Sun Sep 20, screenings available' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Thu Sep 17/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Book Inception at 6:00 PM, Central Cinema, Hall 1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Book .*Closed Cinema/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Book .*11:00 AM/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(4);
    expect(fetchCatalog).toHaveBeenCalledOnce();
    expect(fetchCinemas).toHaveBeenCalledOnce();
  });

  it('selects the actual current day even when empty, then offers the next screening date', async () => {
    await openCinemas();
    const today = screen.getByRole('button', { name: 'Today, Sat Sep 19, no upcoming screenings' });
    fireEvent.click(today);
    expect(today).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'No upcoming screenings on this day' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Book / })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Next screening.*Sep 20/ }));
    expect(screen.getByRole('button', { name: 'Sun Sep 20, screenings available' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(4);
  });

  it('honors the cinema URL and synchronizes cinema cards, shared selection, contact details, and route', async () => {
    await openCinemas('/cinemas?cinema=c-2&from=footer');
    expect(useCinemaStore.getState().selectedCinemaId).toBe('c-2');
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Book .*Central Cinema/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Central Cinema Level 3, Central Mall/ }));
    expect(useCinemaStore.getState().selectedCinemaId).toBe('c-1');
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/cinemas?cinema=c-1&from=footer');
    expect(screen.queryByRole('button', { name: /Book .*Riverside Cinema/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute('href', cinemas[0].googleMapsUrl);
    expect(screen.getByRole('link', { name: '023-888-999' })).toHaveAttribute('href', 'tel:023888999');

    fireEvent.click(screen.getByRole('button', { name: 'All cinemas' }));
    expect(screen.getByLabelText('Current route')).toHaveTextContent('cinema=ALL');
    expect(useCinemaStore.getState().selectedCinemaId).toBe('ALL');
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(4);
  });

  it('combines genre search, format and time filters, with a working clear action for empty results', async () => {
    await openCinemas();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search movies or genres' }), { target: { value: ' sci-fi ' } });
    expect(screen.queryByRole('heading', { name: 'Inception' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'IMAX' }));
    fireEvent.click(screen.getByRole('button', { name: 'Afternoon (12:00 PM - 5:00 PM)' }));
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Book Interstellar at 2:00 PM, Central Cinema, Hall 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Evening (5:00 PM onward)' }));
    expect(screen.getByRole('button', { name: 'Book Interstellar at 8:00 PM, Riverside Cinema, Hall 1' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search movies or genres' }), { target: { value: 'no matching movie' } });
    expect(screen.getByRole('heading', { name: 'No screenings match your search' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search & filters' }));
    expect(screen.getByRole('textbox', { name: 'Search movies or genres' })).toHaveValue('');
    expect(screen.getAllByRole('button', { name: /^Book / })).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'All Formats' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All Showtimes' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps identically named halls at different cinemas in separate labeled groups', async () => {
    await openCinemas();
    const inception = within(screen.getByRole('heading', { name: 'Inception' }).closest('article')!);
    expect(inception.getByText('Central Cinema')).toBeInTheDocument();
    expect(inception.getByText('Riverside Cinema')).toBeInTheDocument();
    expect(inception.getAllByText('Hall 1')).toHaveLength(2);
    expect(inception.getAllByRole('button', { name: /^Book / })).toHaveLength(2);
    fireEvent.click(inception.getByRole('button', { name: 'Book Inception at 6:00 PM, Riverside Cinema, Hall 1' }));
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/booking/st-evening?movieId=m-1');
  });

  it('rechecks a previously rendered show before navigating if booking closes while the page is open', async () => {
    await openCinemas('/cinemas?cinema=c-1');
    vi.setSystemTime(new Date('2026-09-20T09:57:00+07:00'));
    fireEvent.click(screen.getByRole('button', { name: 'Book Inception at 10:00 AM, Central Cinema, Hall 1' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Booking has closed for that screening');
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/cinemas?cinema=c-1');
    expect(screen.queryByRole('button', { name: 'Book Inception at 10:00 AM, Central Cinema, Hall 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Interstellar at 2:00 PM, Central Cinema, Hall 1' })).toBeInTheDocument();
  });

  it('keeps real cinema locations available to guests and preserves their selection in the sign-in return URL', async () => {
    useMovieStore.setState({ catalogRequiresSignIn: true, showtimes: [] });
    renderCinemas('/cinemas?cinema=c-1');
    expect(await screen.findByRole('heading', { name: 'Sign in to see available screenings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute('href', cinemas[0].googleMapsUrl);
    expect(screen.queryByRole('button', { name: /^Book / })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No upcoming screenings on this day' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Riverside Cinema Riverside Walkway/ }));
    expect(screen.getByRole('link', { name: 'Sign in to continue' })).toHaveAttribute('href', '/login?redirect=%2Fcinemas%3Fcinema%3Dc-2');
    expect(useCinemaStore.getState().selectedCinemaId).toBe('c-2');
  });
});
