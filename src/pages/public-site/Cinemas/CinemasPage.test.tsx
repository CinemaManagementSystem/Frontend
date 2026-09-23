import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { CinemasPage } from './CinemasPage';
import { useCinemaStore, type CinemaLocation } from '@/store/cinemaStore';
import { useMovieStore } from '@/store/movieStore';
import type { Movie, Showtime } from '@/types/movie';

const fetchCatalog = vi.fn().mockResolvedValue(undefined);
const fetchCinemas = vi.fn().mockResolvedValue(undefined);

const cinemas: CinemaLocation[] = [
  {
    id: 'c-1',
    theaterId: 1,
    name: 'Central Cinema',
    address: 'Level 3, Central Mall',
    phone: '023-888-999',
    status: 'OPEN',
    locationId: 1,
    locationName: 'Central Mall',
    city: 'Phnom Penh',
    googleMapsUrl: 'https://maps.google.com/?q=11.55,104.92',
    latitude: 11.55,
    longitude: 104.92,
  },
  {
    id: 'c-2',
    theaterId: 2,
    name: 'Riverside Cinema',
    address: 'Riverside Walkway',
    phone: '063-555-444',
    status: 'OPEN',
    locationId: 2,
    locationName: 'Riverside',
    city: 'Siem Reap',
    googleMapsUrl: 'https://maps.google.com/?q=13.36,103.85',
    latitude: 13.36,
    longitude: 103.85,
  },
  {
    id: 'c-3',
    theaterId: 3,
    name: 'Closed Cinema',
    address: 'North Street',
    phone: '',
    status: 'CLOSED',
    locationId: 3,
    locationName: 'North',
    city: 'Phnom Penh',
    googleMapsUrl: null,
    latitude: null,
    longitude: null,
  },
];

const makeMovie = (id: string, title: string, genres: string[]): Movie => ({
  id,
  title,
  genres,
  slug: title.toLowerCase(),
  description: '',
  posterUrl: '',
  backdropUrl: '',
  rating: 8,
  voteCount: 1,
  durationMinutes: 140,
  releaseDate: '2026-09-01',
  director: '',
  cast: [],
  status: 'NOW_SHOWING',
  price: 5,
});

const makeShow = (
  id: string,
  movieId: string,
  cinemaId: string,
  time: string,
  overrides: Partial<Showtime> = {}
): Showtime => ({
  id,
  movieId,
  cinemaId,
  cinemaName: cinemas.find((c) => c.id === cinemaId)!.name,
  hallName: 'Hall 1',
  startTime: `2026-09-20T${time}:00`,
  endTime: '2026-09-20T23:00:00',
  date: '2026-09-20',
  time,
  status: 'ACTIVE',
  format: '2D',
  price: 5,
  vipPrice: 8,
  occupiedSeats: [],
  ...overrides,
});

const shows = [
  makeShow('st-past', 'm-1', 'c-1', '18:00', { date: '2026-09-17', startTime: '2026-09-17T18:00:00' }),
  makeShow('st-morning', 'm-1', 'c-1', '10:00'),
  makeShow('st-evening', 'm-1', 'c-2', '18:00'),
  makeShow('st-afternoon', 'm-2', 'c-1', '14:00', { format: 'IMAX' }),
  makeShow('st-night', 'm-2', 'c-2', '20:00', { format: 'IMAX' }),
  makeShow('st-closed-cinema', 'm-1', 'c-3', '19:00'),
];

function RouteLocation() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}{location.search}</output>;
}

function renderCinemas(path = '/cinemas') {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CinemasPage />
      <RouteLocation />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-19T08:00:00+07:00'));
  vi.clearAllMocks();
  localStorage.clear();
  useCinemaStore.setState({
    ...useCinemaStore.getInitialState(),
    cinemas,
    loaded: true,
    selectedCinemaId: 'ALL',
    fetchCinemas,
  });
  useMovieStore.setState({
    ...useMovieStore.getInitialState(),
    fetchCatalog,
    movies: [
      makeMovie('m-1', 'Inception', ['Thriller']),
      makeMovie('m-2', 'Interstellar', ['Sci-Fi']),
    ],
    showtimes: shows,
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('CinemasPage UI and Discovery', () => {
  it('renders cinema locations and allows searching by name or address', async () => {
    renderCinemas();
    expect(screen.getByText('Central Cinema')).toBeInTheDocument();
    expect(screen.getByText('Riverside Cinema')).toBeInTheDocument();
    expect(screen.getByText('Closed Cinema')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', { name: 'Search cinema locations' });
    fireEvent.change(searchInput, { target: { value: 'Central' } });

    expect(screen.getByText('Central Cinema')).toBeInTheDocument();
    expect(screen.queryByText('Riverside Cinema')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear cinema search' }));
    expect(screen.getByText('Riverside Cinema')).toBeInTheDocument();
  });

  it('filters cinemas by city pills', async () => {
    renderCinemas();
    const siemReapButton = screen.getByRole('button', { name: /^Siem Reap \(\d+\)$/i });
    fireEvent.click(siemReapButton);

    expect(screen.getByText('Riverside Cinema')).toBeInTheDocument();
    expect(screen.queryByText('Central Cinema')).not.toBeInTheDocument();

    const allCitiesButton = screen.getByRole('button', { name: /^All Cities \(\d+\)$/i });
    fireEvent.click(allCitiesButton);
    expect(screen.getByText('Central Cinema')).toBeInTheDocument();
    expect(screen.getByText('Riverside Cinema')).toBeInTheDocument();
  });

  it('navigates to cinema detail page when clicking a cinema card', async () => {
    renderCinemas();
    const centralCard = screen.getByRole('button', { name: /Central Cinema/i });
    fireEvent.click(centralCard);

    expect(screen.getByLabelText('Current route')).toHaveTextContent('/cinemas/c-1');
  });

  it('displays directions and phone link for selected cinema', async () => {
    renderCinemas('/cinemas?cinema=c-1');
    expect(screen.getByRole('link', { name: /Directions/i })).toHaveAttribute('href', cinemas[0].googleMapsUrl);
    expect(screen.getByRole('link', { name: '023-888-999' })).toHaveAttribute('href', 'tel:023888999');
  });

  it('triggers refresh when clicking retry or refresh icon', async () => {
    renderCinemas();
    const refreshBtn = screen.getByRole('button', { name: 'Refresh cinema listings' });
    fireEvent.click(refreshBtn);

    expect(fetchCatalog).toHaveBeenCalled();
    expect(fetchCinemas).toHaveBeenCalled();
  });

  it('shows an alert when showtimes cannot be loaded', async () => {
    fetchCatalog.mockRejectedValueOnce(new Error('Temporarily unavailable'));
    renderCinemas();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Showtimes could not load.');
    expect(alert).toHaveTextContent('Temporarily unavailable');
  });
});
