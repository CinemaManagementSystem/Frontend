import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { INITIAL_BOOKINGS, INITIAL_MOVIES, INITIAL_SHOWTIMES } from './movieStore';
import type { Booking } from '@/types/booking';
import type { Movie, Showtime } from '@/types/movie';

interface MovieState {
  movies: Movie[];
  showtimes: Showtime[];
  bookings: Booking[];
  selectedCategory: string;
  searchQuery: string;
}

const initialState: MovieState = {
  movies: INITIAL_MOVIES,
  showtimes: INITIAL_SHOWTIMES,
  bookings: INITIAL_BOOKINGS,
  selectedCategory: 'ALL',
  searchQuery: '',
};

const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addMovie: (state, action: PayloadAction<Omit<Movie, 'id' | 'slug'>>) => {
      const id = `m-${Date.now()}`;
      const slug = action.payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newMovie: Movie = { ...action.payload, id, slug };
      state.movies = [newMovie, ...state.movies];
    },
    updateMovie: (state, action: PayloadAction<{ id: string; updated: Partial<Movie> }>) => {
      state.movies = state.movies.map((m) =>
        m.id === action.payload.id ? { ...m, ...action.payload.updated } : m,
      );
    },
    deleteMovie: (state, action: PayloadAction<string>) => {
      state.movies = state.movies.filter((m) => m.id !== action.payload);
    },
    addBooking: (state, action: PayloadAction<Omit<Booking, 'id' | 'bookingDate'>>) => {
      const id = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
      const bookingDate = new Date().toISOString();
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}-CINEMATIQUE`;
      const newBooking: Booking = { ...action.payload, id, bookingDate, qrCodeUrl };

      state.bookings = [newBooking, ...state.bookings];
      state.showtimes = state.showtimes.map((st) =>
        st.id === action.payload.showtimeId
          ? { ...st, occupiedSeats: [...st.occupiedSeats, ...action.payload.seats] }
          : st,
      );
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.map((b) =>
        b.id === action.payload ? { ...b, status: 'CANCELLED' } : b,
      );
    },
    seedShowtimesForDate: (state, action: PayloadAction<string>) => {
      const dateStr = action.payload;
      const existing = state.showtimes.some((st) => st.date === dateStr && st.id.startsWith('st-gen-'));
      if (existing) return;

      const newShowtimes: Showtime[] = [];
      const cinemas = [
        { id: 'c-1', name: 'Cinematique Grand Central' },
        { id: 'c-2', name: 'Cinematique City Center' },
        { id: 'c-3', name: 'Cinematique Sunset Strip' },
      ];

      state.movies.forEach((movie) => {
        cinemas.forEach((cinema) => {
          if (movie.id === 'm-5') {
            newShowtimes.push({
              id: `st-gen-m5-imax-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'IMAX 3D Laser',
              date: dateStr,
              time: '16:20',
              format: 'IMAX',
              price: 18.0,
              vipPrice: 26.0,
              occupiedSeats: ['A3', 'A4', 'B5', 'B6'],
            });
            newShowtimes.push({
              id: `st-gen-m5-imax2-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'IMAX 3D Laser',
              date: dateStr,
              time: '17:45',
              format: 'IMAX',
              price: 18.0,
              vipPrice: 26.0,
              occupiedSeats: ['B1', 'B2', 'C3', 'C4', 'D5', 'D6'],
            });
            newShowtimes.push({
              id: `st-gen-m5-imax3-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'IMAX 3D Laser',
              date: dateStr,
              time: '21:10',
              format: 'IMAX',
              price: 18.0,
              vipPrice: 26.0,
              occupiedSeats: ['E1', 'E2'],
            });
            newShowtimes.push({
              id: `st-gen-m5-std1-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '11:00',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m5-std2-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '13:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: ['C1', 'C2'],
            });
            newShowtimes.push({
              id: `st-gen-m5-std3-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '16:00',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: ['A1', 'A2', 'B3', 'B4'],
            });
            newShowtimes.push({
              id: `st-gen-m5-std4-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '18:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: Array.from({ length: 80 }, (_, i) => {
                const row = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][Math.floor(i / 10)];
                const seatNum = (i % 10) + 1;
                return `${row}${seatNum}`;
              }),
            });
            newShowtimes.push({
              id: `st-gen-m5-std5-${cinema.id}-${dateStr}`,
              movieId: 'm-5',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '22:00',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
          }

          if (movie.id === 'm-7') {
            newShowtimes.push({
              id: `st-gen-m7-vip1-${cinema.id}-${dateStr}`,
              movieId: 'm-7',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: "Director's Suite VIP",
              date: dateStr,
              time: '15:00',
              format: 'VIP',
              price: 25.0,
              vipPrice: 45.0,
              occupiedSeats: ['F1', 'F2', 'G3'],
            });
            newShowtimes.push({
              id: `st-gen-m7-vip2-${cinema.id}-${dateStr}`,
              movieId: 'm-7',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: "Director's Suite VIP",
              date: dateStr,
              time: '18:30',
              format: 'VIP',
              price: 25.0,
              vipPrice: 45.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m7-vip3-${cinema.id}-${dateStr}`,
              movieId: 'm-7',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: "Director's Suite VIP",
              date: dateStr,
              time: '21:45',
              format: 'VIP',
              price: 25.0,
              vipPrice: 45.0,
              occupiedSeats: ['F4', 'F5', 'F6', 'G7', 'G8'],
            });
            newShowtimes.push({
              id: `st-gen-m7-dolby1-${cinema.id}-${dateStr}`,
              movieId: 'm-7',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Dolby Atmos',
              date: dateStr,
              time: '12:45',
              format: 'Dolby',
              price: 15.0,
              vipPrice: 22.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m7-dolby2-${cinema.id}-${dateStr}`,
              movieId: 'm-7',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Dolby Atmos',
              date: dateStr,
              time: '15:50',
              format: 'Dolby',
              price: 15.0,
              vipPrice: 22.0,
              occupiedSeats: ['C1', 'C2'],
            });
          }

          if (movie.id === 'm-8') {
            newShowtimes.push({
              id: `st-gen-m8-3d1-${cinema.id}-${dateStr}`,
              movieId: 'm-8',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard 3D',
              date: dateStr,
              time: '10:15',
              format: '3D',
              price: 15.0,
              vipPrice: 22.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m8-3d2-${cinema.id}-${dateStr}`,
              movieId: 'm-8',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard 3D',
              date: dateStr,
              time: '12:30',
              format: '3D',
              price: 15.0,
              vipPrice: 22.0,
              occupiedSeats: ['B1', 'B2'],
            });
            newShowtimes.push({
              id: `st-gen-m8-3d3-${cinema.id}-${dateStr}`,
              movieId: 'm-8',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard 3D',
              date: dateStr,
              time: '14:45',
              format: '3D',
              price: 15.0,
              vipPrice: 22.0,
              occupiedSeats: [],
            });
          }

          if (movie.id === 'm-2') {
            newShowtimes.push({
              id: `st-gen-m2-vip1-${cinema.id}-${dateStr}`,
              movieId: 'm-2',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: "Director's Suite VIP",
              date: dateStr,
              time: '14:00',
              format: 'VIP',
              price: 25.0,
              vipPrice: 45.0,
              occupiedSeats: ['F1', 'F2'],
            });
            newShowtimes.push({
              id: `st-gen-m2-std1-${cinema.id}-${dateStr}`,
              movieId: 'm-2',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '11:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m2-std2-${cinema.id}-${dateStr}`,
              movieId: 'm-2',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '15:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: ['A3', 'B4'],
            });
            newShowtimes.push({
              id: `st-gen-m2-std3-${cinema.id}-${dateStr}`,
              movieId: 'm-2',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '20:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
          }

          if (movie.id === 'm-3') {
            newShowtimes.push({
              id: `st-gen-m3-3d1-${cinema.id}-${dateStr}`,
              movieId: 'm-3',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard 3D',
              date: dateStr,
              time: '12:00',
              format: '3D',
              price: 15.0,
              vipPrice: 22.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m3-std1-${cinema.id}-${dateStr}`,
              movieId: 'm-3',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '10:00',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m3-std2-${cinema.id}-${dateStr}`,
              movieId: 'm-3',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '14:00',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: ['B1', 'B2'],
            });
            newShowtimes.push({
              id: `st-gen-m3-std3-${cinema.id}-${dateStr}`,
              movieId: 'm-3',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '18:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
          }

          if (movie.id === 'm-4') {
            newShowtimes.push({
              id: `st-gen-m4-std1-${cinema.id}-${dateStr}`,
              movieId: 'm-4',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '12:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
            newShowtimes.push({
              id: `st-gen-m4-std2-${cinema.id}-${dateStr}`,
              movieId: 'm-4',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '16:30',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: ['E1', 'E2'],
            });
            newShowtimes.push({
              id: `st-gen-m4-std3-${cinema.id}-${dateStr}`,
              movieId: 'm-4',
              cinemaId: cinema.id,
              cinemaName: cinema.name,
              hallName: 'Standard Digital',
              date: dateStr,
              time: '20:45',
              format: '2D',
              price: 14.0,
              vipPrice: 20.0,
              occupiedSeats: [],
            });
          }
        });
      });

      state.showtimes = [...state.showtimes, ...newShowtimes];
    },
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  addMovie,
  updateMovie,
  deleteMovie,
  addBooking,
  cancelBooking,
  seedShowtimesForDate,
} = movieSlice.actions;

export const selectMovieById = (state: MovieState, id: string): Movie | undefined =>
  state.movies.find((m) => m.id === id || m.slug === id);

export const selectShowtimesByMovieId = (state: MovieState, movieId: string): Showtime[] =>
  state.showtimes.filter((st) => st.movieId === movieId);

export const movieReducer = movieSlice.reducer;