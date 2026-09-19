import { create } from 'zustand';
import type { Movie, Showtime } from '@/types/movie';
import type { Booking } from '@/types/booking';
import { movieAdminService } from '@/services/movieAdminService';
import { showService } from '@/services/showService';
import { seatService } from '@/services/seatService';
import { bookingAdminService } from '@/services/bookingAdminService';
import { bookingSeatService } from '@/services/bookingSeatService';
import { screenService } from '@/services/screenService';
import { theaterService } from '@/services/theaterService';

interface MovieState {
  movies: Movie[];
  showtimes: Showtime[];
  bookings: Booking[];
  loading: boolean;
  selectedCategory: string;
  searchQuery: string;
  fetchCatalog: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  getMovieById: (id: string) => Movie | undefined;
  getShowtimesByMovieId: (movieId: string) => Showtime[];
  cancelBooking: (bookingId: string) => Promise<void>;
}

type ApiMovie = Awaited<ReturnType<typeof movieAdminService.list>>[number];

const toMovie = (movie: ApiMovie): Movie => ({
  id: `m-${movie.id}`,
  title: movie.title,
  slug: movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  description: movie.description,
  posterUrl: movie.posterUrl,
  backdropUrl: movie.posterUrl,
  trailerUrl: undefined,
  rating: 0,
  voteCount: 0,
  durationMinutes: movie.durationMinutes,
  releaseDate: movie.releaseDate,
  genres: movie.genre ? movie.genre.split(',').map((genre) => genre.trim()) : [],
  director: '',
  cast: [],
  status: movie.status === 'NOW_SHOWING' ? 'NOW_SHOWING' : movie.status === 'COMING_SOON' ? 'COMING_SOON' : 'FEATURED',
  price: 0,
});

export const useMovieStore = create<MovieState>((set, get) => ({
  movies: [],
  showtimes: [],
  bookings: [],
  loading: false,
  selectedCategory: 'ALL',
  searchQuery: '',

  fetchCatalog: async () => {
    set({ loading: true });
    try {
      const [apiMovies, apiShows, seats, screens, theaters] = await Promise.all([
        movieAdminService.list(),
        showService.list(),
        seatService.list(),
        screenService.list(),
        theaterService.list(),
      ]);
      const movies = apiMovies.map(toMovie);
      const screenById = new Map(screens.map((screen) => [screen.id, screen]));
      const theaterById = new Map(theaters.map((theater) => [theater.id, theater]));
      const showtimes = apiShows.map((show): Showtime => {
        const screen = screenById.get(show.screenId);
        const theater = screen ? theaterById.get(screen.theaterId) : undefined;
        const screenSeats = seats.filter((seat) => seat.screenId === show.screenId);
        const standard = screenSeats.find((seat) => seat.seatType === 'STANDARD')?.price ?? show.ticketPrice;
        const vip = screenSeats.find((seat) => seat.seatType === 'VIP')?.price ?? standard;
        const occupiedSeats = screenSeats.filter((seat) => seat.status.toUpperCase() !== 'AVAILABLE').map((seat) => seat.seatNumber);
        
        const start = new Date(show.startTime);
        let dateStr = show.startTime ? show.startTime.slice(0, 10) : '';
        let timeStr = show.startTime || '';

        if (!Number.isNaN(start.getTime())) {
          const yyyy = start.getFullYear();
          const mm = String(start.getMonth() + 1).padStart(2, '0');
          const dd = String(start.getDate()).padStart(2, '0');
          dateStr = `${yyyy}-${mm}-${dd}`;

          const hh = String(start.getHours()).padStart(2, '0');
          const min = String(start.getMinutes()).padStart(2, '0');
          timeStr = `${hh}:${min}`;
        }

        const rawScreenType = (screen?.screenType || '2D').toUpperCase();
        let normalizedFormat: Showtime['format'] = '2D';
        if (rawScreenType === '3D') normalizedFormat = '3D';
        else if (rawScreenType === 'IMAX') normalizedFormat = 'IMAX';
        else if (rawScreenType === '4DX') normalizedFormat = '4DX';
        else if (rawScreenType === 'VIP') normalizedFormat = 'VIP';
        else if (rawScreenType === 'DOLBY' || rawScreenType === 'DOLBY ATMOS') normalizedFormat = 'Dolby';
        else normalizedFormat = '2D'; // STANDARD, 2D, DIGITAL, etc.

        return {
          id: `st-${show.id}`,
          movieId: `m-${show.movieId}`,
          cinemaId: theater ? `c-${theater.id}` : `theater-${screen?.theaterId ?? 0}`,
          cinemaName: theater?.name ?? 'Cinema',
          hallName: screen?.name ?? 'Screen',
          date: dateStr,
          time: timeStr,
          format: normalizedFormat,
          price: standard,
          vipPrice: vip,
          occupiedSeats,
        };
      });
      set({ movies, showtimes });
    } finally {
      set({ loading: false });
    }
  },

  fetchBookings: async () => {
    const [apiBookings, apiMovies, apiShows, allSeats] = await Promise.all([
      bookingAdminService.list(),
      movieAdminService.list(),
      showService.list(),
      bookingSeatService.list().catch(() => []),
    ]);
    const movies = new Map(apiMovies.map((movie) => [movie.id, movie]));
    const shows = new Map(apiShows.map((show) => [show.id, show]));
    const bookings = apiBookings.map((booking): Booking => {
      const show = shows.get(booking.showId);
      const movie = show ? movies.get(show.movieId) : undefined;
      return {
        id: String(booking.id),
        userId: String(booking.customerId),
        userName: `Customer #${booking.customerId}`,
        userEmail: '',
        movieId: movie ? `m-${movie.id}` : '',
        movieTitle: movie?.title ?? 'Movie',
        moviePoster: movie?.posterUrl ?? '',
        showtimeId: `st-${booking.showId}`,
        cinemaName: 'Cinema',
        hallName: 'Screen',
        showDate: show?.startTime?.slice(0, 10) ?? '',
        showTime: show?.startTime?.slice(11, 16) ?? '',
        seats: allSeats.filter((seat) => seat.bookingId === booking.id).map((seat) => String(seat.seatId)),
        totalAmount: Number(booking.totalAmount ?? 0),
        paymentMethod: 'QR_CODE',
        status: booking.status === 'CONFIRMED' ? 'CONFIRMED' : booking.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
        bookingDate: booking.bookedAt,
      };
    });
    set({ bookings });
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  getMovieById: (id) => get().movies.find((movie) => movie.id === id || movie.slug === id),
  getShowtimesByMovieId: (movieId) => get().showtimes.filter((showtime) => showtime.movieId === movieId),
  cancelBooking: async (bookingId) => {
    await bookingAdminService.remove(Number(bookingId));
    await get().fetchBookings();
  },
}));
