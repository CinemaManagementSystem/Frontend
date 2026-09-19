import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
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
  movies: [],
  showtimes: [],
  bookings: [],
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
    setCatalog: (state, action: PayloadAction<{ movies: Movie[]; showtimes: Showtime[] }>) => {
      state.movies = action.payload.movies;
      state.showtimes = action.payload.showtimes;
    },
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
  },
});

export const { setSelectedCategory, setSearchQuery, setCatalog, setBookings } = movieSlice.actions;
export const movieReducer = movieSlice.reducer;
