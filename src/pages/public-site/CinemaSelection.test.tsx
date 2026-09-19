import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './Home/HomePage';
import { MovieDetailPage } from './Movies/MovieDetailPage';
import { ShowcasePage } from './Showcase/ShowcasePage';
import { useMovieStore } from '@/store/movieStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useMovieAdminStore } from '@/store/movieAdminStore';
import { useCategoryStore } from '@/store/categoryStore';
import type { Movie, Showtime } from '@/types/movie';

const movie: Movie = {
  id: 'm-1', title: 'Test Movie', slug: 'test-movie', description: 'A movie.', posterUrl: '', backdropUrl: '',
  rating: 8, voteCount: 1, durationMinutes: 120, releaseDate: '2099-01-01', genres: ['Drama'], director: '',
  cast: [], status: 'NOW_SHOWING', price: 10,
};
const makeShow = (id: number, cinemaId: string, time: string): Showtime => ({
  id: `st-${id}`, movieId: movie.id, cinemaId, cinemaName: cinemaId === 'c-1' ? 'Central Cinema' : 'Riverside Cinema',
  hallName: 'Hall 1', startTime: `2099-01-01T${time}:00`, endTime: '2099-01-01T23:59:00', status: 'ACTIVE',
  date: '2099-01-01', time, format: '2D', price: 10, vipPrice: 15, occupiedSeats: [],
});

function LocationResult() {
  const location = useLocation();
  return <div data-testid="destination">{location.pathname}{location.search}</div>;
}

function openPage(page: 'home' | 'details' | 'showcase') {
  const path = page === 'details' ? '/movies/m-1' : `/${page}`;
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/home" element={<HomePage />} />
    <Route path="/movies/:id" element={page === 'home' ? <LocationResult /> : <MovieDetailPage />} />
    <Route path="/showcase" element={<ShowcasePage />} />
    <Route path="/booking/:id" element={<LocationResult />} />
  </Routes></MemoryRouter>);
}

beforeEach(() => {
  cleanup();
  useMovieStore.setState({
    movies: [movie], showtimes: [makeShow(1, 'c-1', '18:00'), makeShow(2, 'c-2', '20:00')],
    catalogRequiresSignIn: false, loading: false, searchQuery: '', fetchCatalog: vi.fn().mockResolvedValue(undefined),
  });
  useCinemaStore.setState({
    selectedCinemaId: 'c-2',
    cinemas: ['Central Cinema', 'Riverside Cinema', 'West Cinema'].map((name, index) => ({
      id: `c-${index + 1}`, theaterId: index + 1, name, address: '', phone: '', status: 'OPEN', locationId: 1,
      locationName: '', city: '', googleMapsUrl: null, latitude: null, longitude: null,
    })),
  });
  useMovieAdminStore.setState({ movies: [{
    id: 1, title: movie.title, categoryId: 1, description: movie.description, posterUrl: '', posterPublicId: null,
    genre: 'Drama', language: 'English', durationMinutes: 120, releaseDate: movie.releaseDate, status: 'NOW_SHOWING',
  }], loading: false, fetchAll: vi.fn().mockResolvedValue(undefined) });
  useCategoryStore.setState({ categories: [], fetchAll: vi.fn().mockResolvedValue(undefined) });
});

describe('shared cinema selection across public booking entry points', () => {
  it('books the Home screening at the selected cinema instead of the first other-cinema show', () => {
    openPage('home');
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }));
    expect(screen.getByTestId('destination')).toHaveTextContent('/booking/st-2?movieId=m-1');
  });

  it('uses the earliest screening across locations when All cinemas is selected', () => {
    useCinemaStore.setState({ selectedCinemaId: 'ALL' });
    openPage('home');
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }));
    expect(screen.getByTestId('destination')).toHaveTextContent('/booking/st-1?movieId=m-1');
  });

  it('routes Home guests to movie details rather than guessing a cinema', () => {
    useMovieStore.setState({ catalogRequiresSignIn: true });
    openPage('home');
    fireEvent.click(screen.getByRole('button', { name: 'Book Now' }));
    expect(screen.getByTestId('destination')).toHaveTextContent('/movies/m-1');
  });

  it('shows only selected-cinema screenings on movie details', () => {
    openPage('details');
    expect(screen.getByRole('button', { name: '20:00 - Reserve' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '18:00 - Reserve' })).not.toBeInTheDocument();
  });

  it('names the cinema with no shows and lets the user recover by viewing all locations', () => {
    useCinemaStore.setState({ selectedCinemaId: 'c-3' });
    openPage('details');
    expect(screen.getByText('No upcoming showtimes at West Cinema')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View all cinemas' }));
    expect(useCinemaStore.getState().selectedCinemaId).toBe('ALL');
    expect(screen.getAllByRole('button', { name: /Reserve/ })).toHaveLength(2);
  });

  it('filters Showcase by the selected cinema using the joined catalog', () => {
    openPage('showcase');
    fireEvent.click(screen.getByRole('button', { name: 'View Showtimes (1)' }));
    fireEvent.click(screen.getByRole('button', { name: /Riverside Cinema.*Hall 1/ }));
    expect(screen.getByTestId('destination')).toHaveTextContent('/booking/st-2?movieId=m-1');
  });

  it('asks Showcase guests to sign in before showing cinema booking choices', () => {
    useMovieStore.setState({ catalogRequiresSignIn: true });
    openPage('showcase');
    expect(screen.getByRole('link', { name: 'Sign in to view showtimes' })).toHaveAttribute('href', '/login?redirect=%2Fshowcase');
    expect(screen.queryByRole('button', { name: /View Showtimes/ })).not.toBeInTheDocument();
  });
});
