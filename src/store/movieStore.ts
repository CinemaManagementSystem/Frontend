import { create } from 'zustand';
import { Movie, Showtime } from '@/types/movie';
import { Booking } from '@/types/booking';

interface MovieState {
  movies: Movie[];
  showtimes: Showtime[];
  bookings: Booking[];
  selectedCategory: string;
  searchQuery: string;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  addMovie: (movie: Omit<Movie, 'id' | 'slug'>) => void;
  updateMovie: (id: string, updated: Partial<Movie>) => void;
  deleteMovie: (id: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'bookingDate'>) => Booking;
  cancelBooking: (bookingId: string) => void;
  getMovieById: (id: string) => Movie | undefined;
  getShowtimesByMovieId: (movieId: string) => Showtime[];
  seedShowtimesForDate: (dateStr: string) => void;
}

export const INITIAL_MOVIES: Movie[] = [
  {
    id: 'm-1',
    title: 'NEON NIGHTS',
    slug: 'neon-nights',
    description: 'A cybersecurity hacker gets trapped in a virtual neon underworld and must hack his way out through layers of digital defense systems.',
    posterUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4',
    rating: 4.8,
    voteCount: 1200,
    durationMinutes: 124,
    releaseDate: '2026-09-01',
    genres: ['Sci-Fi', 'Thriller'],
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz'],
    status: 'COMING_SOON',
    price: 14.5,
  },
  {
    id: 'm-2',
    title: 'THE LAST OASIS',
    slug: 'the-last-oasis',
    description: 'In a dying world, hope is the furthest horizon. A small group of survivors embarks on a dangerous journey to find the last green valley on Earth.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
    rating: 4.5,
    voteCount: 890,
    durationMinutes: 142,
    releaseDate: '2026-08-20',
    genres: ['Drama', 'Adventure'],
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldana'],
    status: 'NOW_SHOWING',
    price: 16.0,
  },
  {
    id: 'm-3',
    title: 'QUANTUM SHIFT',
    slug: 'quantum-shift',
    description: 'Reality is fragmenting. Survive the shift. A brilliant physicist discovers a machine that can rewrite timelines, but it attracts forces that want to weaponize it.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    rating: 4.2,
    voteCount: 650,
    durationMinutes: 118,
    releaseDate: '2026-08-15',
    genres: ['Sci-Fi', 'Mystery'],
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt'],
    status: 'NOW_SHOWING',
    price: 15.0,
  },
  {
    id: 'm-4',
    title: 'ECHOES OF THE PAST',
    slug: 'echoes-of-the-past',
    description: 'Time may fade, but memories remain. A classical pianist suffering from memory loss reconstructs her life through the melodies she once played.',
    posterUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    rating: 4.6,
    voteCount: 1100,
    durationMinutes: 135,
    releaseDate: '2026-08-18',
    genres: ['Drama', 'Romance'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya'],
    status: 'NOW_SHOWING',
    price: 15.5,
  },
  {
    id: 'm-5',
    title: 'INTERSTELLAR DRIFT',
    slug: 'interstellar-drift',
    description: 'When Earth becomes uninhabitable in the future, a team of pioneers travels through a wormhole in search of a new home, discovering the secrets of gravity, time, and human connection.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    rating: 4.9,
    voteCount: 6890,
    durationMinutes: 165,
    releaseDate: '2026-07-01',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    status: 'NOW_SHOWING',
    price: 14.0,
  },
  {
    id: 'm-6',
    title: 'SIREN CALL',
    slug: 'siren-call',
    description: 'A terrifying marine expedition goes wrong when the crew encounters an ancient supernatural force calling from the deep ocean.',
    posterUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    rating: 4.0,
    voteCount: 450,
    durationMinutes: 105,
    releaseDate: '2026-09-15',
    genres: ['Horror', 'Thriller'],
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld'],
    status: 'COMING_SOON',
    price: 12.5,
  },
  {
    id: 'm-7',
    title: 'THE GILDED CAGE',
    slug: 'the-gilded-cage',
    description: 'A high-stakes dramatic mystery surrounding the complex relationships and secrets hidden behind the walls of a family mansion.',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    rating: 4.7,
    voteCount: 1540,
    durationMinutes: 132,
    releaseDate: '2026-08-01',
    genres: ['Drama', 'Mystery'],
    director: 'Olivier Masset-Depasse',
    cast: ['Anne Coesens', 'Arieh Worthalter'],
    status: 'NOW_SHOWING',
    price: 15.0,
  },
  {
    id: 'm-8',
    title: 'NEON FOREST',
    slug: 'neon-forest',
    description: 'A charming animated film about a hidden glowing ecosystem that becomes threatened by an expanding cybercity.',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    rating: 4.2,
    voteCount: 890,
    durationMinutes: 98,
    releaseDate: '2026-08-15',
    genres: ['Animation', 'Family', 'Fantasy'],
    director: 'Makoto Shinkai',
    cast: ['Ryunosuke Kamiki', 'Mone Kamishiraishi'],
    status: 'NOW_SHOWING',
    price: 12.5,
  },
  {
    id: 'm-9',
    title: 'URBAN JUNGLE',
    slug: 'urban-jungle',
    description: 'In the concrete wilderness, only the strongest survive. A gritty crime drama about a young investigator uncovering corruption inside a mega-corporation.',
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    trailerUrl: 'https://www.youtube.com/embed/cqGjhVJWtEg',
    rating: 4.4,
    voteCount: 950,
    durationMinutes: 130,
    releaseDate: '2026-10-01',
    genres: ['Action', 'Crime'],
    director: 'Makoto Shinkai',
    cast: ['Ryunosuke Kamiki', 'Mone Kamishiraishi'],
    status: 'COMING_SOON',
    price: 13.0,
  }
];

export const INITIAL_SHOWTIMES: Showtime[] = [
  {
    id: 'st-1',
    movieId: 'm-1',
    cinemaId: 'c-1',
    cinemaName: 'Cinematique Grand Hall',
    hallName: 'IMAX Theater 1',
    date: '2026-08-21',
    time: '14:30',
    format: 'IMAX',
    price: 15.0,
    vipPrice: 22.0,
    occupiedSeats: ['B3', 'B4', 'C5', 'C6', 'D4', 'D5', 'F7'],
  },
  {
    id: 'st-2',
    movieId: 'm-1',
    cinemaId: 'c-1',
    cinemaName: 'Cinematique Grand Hall',
    hallName: 'Dolby Atmos 2',
    date: '2026-08-21',
    time: '18:00',
    format: '2D',
    price: 13.0,
    vipPrice: 19.0,
    occupiedSeats: ['A1', 'A2', 'E4', 'E5'],
  },
  {
    id: 'st-3',
    movieId: 'm-1',
    cinemaId: 'c-2',
    cinemaName: 'Cinematique Downtown',
    hallName: 'Screen 3',
    date: '2026-08-21',
    time: '21:15',
    format: '4DX',
    price: 18.0,
    vipPrice: 26.0,
    occupiedSeats: ['C3', 'C4', 'D3'],
  },
  {
    id: 'st-4',
    movieId: 'm-2',
    cinemaId: 'c-1',
    cinemaName: 'Cinematique Grand Hall',
    hallName: 'IMAX 3D Laser',
    date: '2026-08-21',
    time: '15:00',
    format: '3D',
    price: 17.0,
    vipPrice: 24.0,
    occupiedSeats: ['B1', 'B2', 'D6', 'D7'],
  },
  {
    id: 'st-5',
    movieId: 'm-3',
    cinemaId: 'c-1',
    cinemaName: 'Cinematique Grand Hall',
    hallName: '70mm Theater',
    date: '2026-08-21',
    time: '19:30',
    format: 'IMAX',
    price: 16.0,
    vipPrice: 23.0,
    occupiedSeats: ['A4', 'B5', 'C5'],
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-98421',
    userId: 'u-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    movieId: 'm-1',
    movieTitle: 'THE BATMAN',
    moviePoster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    showtimeId: 'st-1',
    cinemaName: 'Cinematique Grand Hall',
    hallName: 'IMAX Theater 1',
    showDate: '2026-08-21',
    showTime: '14:30',
    seats: ['D4', 'D5'],
    totalAmount: 44.0,
    paymentMethod: 'CREDIT_CARD',
    status: 'CONFIRMED',
    bookingDate: '2026-08-20T10:15:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BK-98421-CINEMATIQUE',
  },
  {
    id: 'BK-84210',
    userId: 'u-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    movieId: 'm-3',
    movieTitle: 'OPPENHEIMER',
    moviePoster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    showtimeId: 'st-5',
    cinemaName: 'Cinematique Grand Hall',
    hallName: '70mm Theater',
    showDate: '2026-08-15',
    showTime: '19:30',
    seats: ['C5'],
    totalAmount: 23.0,
    paymentMethod: 'PAYPAL',
    status: 'CONFIRMED',
    bookingDate: '2026-08-14T08:30:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BK-84210-CINEMATIQUE',
  },
];

export const useMovieStore = create<MovieState>((set, get) => ({
  movies: INITIAL_MOVIES,
  showtimes: INITIAL_SHOWTIMES,
  bookings: INITIAL_BOOKINGS,
  selectedCategory: 'ALL',
  searchQuery: '',

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addMovie: (movieData) => {
    const id = `m-${Date.now()}`;
    const slug = movieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newMovie: Movie = { ...movieData, id, slug };
    set((state) => ({ movies: [newMovie, ...state.movies] }));
  },

  updateMovie: (id, updated) => {
    set((state) => ({
      movies: state.movies.map((m) => (m.id === id ? { ...m, ...updated } : m)),
    }));
  },

  deleteMovie: (id) => {
    set((state) => ({
      movies: state.movies.filter((m) => m.id !== id),
    }));
  },

  addBooking: (bookingData) => {
    const id = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const bookingDate = new Date().toISOString();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}-CINEMATIQUE`;
    const newBooking: Booking = {
      ...bookingData,
      id,
      bookingDate,
      qrCodeUrl,
    };

    // Update occupied seats in showtime
    set((state) => ({
      bookings: [newBooking, ...state.bookings],
      showtimes: state.showtimes.map((st) =>
        st.id === bookingData.showtimeId
          ? { ...st, occupiedSeats: [...st.occupiedSeats, ...bookingData.seats] }
          : st
      ),
    }));

    return newBooking;
  },

  cancelBooking: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
      ),
    }));
  },

  getMovieById: (id) => get().movies.find((m) => m.id === id || m.slug === id),

  getShowtimesByMovieId: (movieId) =>
    get().showtimes.filter((st) => st.movieId === movieId),

  seedShowtimesForDate: (dateStr) => {
    const existing = get().showtimes.some((st) => st.date === dateStr && st.id.startsWith('st-gen-'));
    if (existing) return;

    const newShowtimes: Showtime[] = [];
    const cinemas = [
      { id: 'c-1', name: 'Cinematique Grand Central' },
      { id: 'c-2', name: 'Cinematique City Center' },
      { id: 'c-3', name: 'Cinematique Sunset Strip' }
    ];

    get().movies.forEach((movie) => {
      cinemas.forEach((cinema) => {
        // Interstellar Drift (m-5)
        if (movie.id === 'm-5') {
          // IMAX
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
            occupiedSeats: ['A3', 'A4', 'B5', 'B6']
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
            occupiedSeats: ['B1', 'B2', 'C3', 'C4', 'D5', 'D6']
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
            occupiedSeats: ['E1', 'E2']
          });

          // Standard
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
            occupiedSeats: []
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
            occupiedSeats: ['C1', 'C2']
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
            occupiedSeats: ['A1', 'A2', 'B3', 'B4']
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
              const row = ['A','B','C','D','E','F','G','H'][Math.floor(i / 10)];
              const seatNum = (i % 10) + 1;
              return `${row}${seatNum}`;
            })
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
            occupiedSeats: []
          });
        }

        // The Gilded Cage (m-7)
        if (movie.id === 'm-7') {
          // VIP Director Suite
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
            occupiedSeats: ['F1', 'F2', 'G3']
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
            occupiedSeats: []
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
            occupiedSeats: ['F4', 'F5', 'F6', 'G7', 'G8']
          });

          // Dolby Atmos
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
            occupiedSeats: []
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
            occupiedSeats: ['C1', 'C2']
          });
        }

        // Neon Forest (m-8)
        if (movie.id === 'm-8') {
          // Standard 3D
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
            occupiedSeats: []
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
            occupiedSeats: ['B1', 'B2']
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
            occupiedSeats: []
          });
        }

        // The Last Oasis (m-2)
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
            occupiedSeats: ['F1', 'F2']
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
            occupiedSeats: []
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
            occupiedSeats: ['A3', 'B4']
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
            occupiedSeats: []
          });
        }

        // Quantum Shift (m-3)
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
            occupiedSeats: []
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
            occupiedSeats: []
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
            occupiedSeats: ['B1', 'B2']
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
            occupiedSeats: []
          });
        }

        // Echoes of the Past (m-4)
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
            occupiedSeats: []
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
            occupiedSeats: ['E1', 'E2']
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
            occupiedSeats: []
          });
        }
      });
    });

    set((state) => ({ showtimes: [...state.showtimes, ...newShowtimes] }));
  },
}));
