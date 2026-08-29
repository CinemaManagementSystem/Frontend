import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { Mainlayout } from '@/layouts/Mainlayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

// Public Pages
import { HomePage } from '@/pages/public-site/Home/HomePage';
import { MoviesPage as PublicMoviesPage } from '@/pages/public-site/Movies/MoviesPage';
import { MovieDetailPage } from '@/pages/public-site/Movies/MovieDetailPage';
import { BookingPage } from '@/pages/public-site/Booking/BookingPage';
import { HistoryPage } from '@/pages/public-site/History/HistoryPage';
import { CinemasPage } from '@/pages/public-site/Cinemas';
import { OffersPage } from '@/pages/public-site/Offers';
import { PremierePage } from '@/pages/public-site/Premiere';
import { NotFoundPage } from '@/pages/public-site/NotFound';

// Auth Pages
import { LoginPage } from '@/pages/auth/Login/LoginPage';
import { RegisterPage } from '@/pages/auth/Register/RegisterPage';

// Admin Pages
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { CategoriesPage } from '@/pages/admin/Categories/CategoriesPage';
import { MoviesPage } from '@/pages/admin/Movies/MoviesPage';
import { LocationsPage } from '@/pages/admin/Locations/LocationsPage';
import { TheatersPage } from '@/pages/admin/Theaters/TheatersPage';
import { ScreensPage } from '@/pages/admin/Screens/ScreensPage';
import { SeatsPage } from '@/pages/admin/Seats/SeatsPage';
import { ShowsPage } from '@/pages/admin/Shows/ShowsPage';
import { BookingsPage } from '@/pages/admin/Bookings/BookingsPage';
import { BookingSeatsPage } from '@/pages/admin/BookingSeats/BookingSeatsPage';
import { ProductCategoriesPage } from '@/pages/admin/ProductCategories/ProductCategoriesPage';
import { ProductsPage } from '@/pages/admin/Products/ProductsPage';
import { UsersPage } from '@/pages/admin/Users/UsersPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Site Layout & Routes */}
      <Route element={<Mainlayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<PublicMoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/booking/:showtimeId" element={<BookingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/cinemas" element={<CinemasPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/premiere" element={<PremierePage />} />
        <Route path="/membership" element={<PremierePage />} />
        <Route path="/premiere-circle" element={<PremierePage />} />
        <Route path="/coming-soon" element={<PremierePage />} />
      </Route>

      {/* Authentication Layout & Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Redirects for legacy/incorrect prefix routes */}
      <Route path="/en/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/en/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Dashboard Layout & Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="movie-categories" element={<CategoriesPage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="theaters" element={<TheatersPage />} />
        <Route path="screens" element={<ScreensPage />} />
        <Route path="seats" element={<SeatsPage />} />
        <Route path="shows" element={<ShowsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="booking-seats" element={<BookingSeatsPage />} />
        <Route path="product-categories" element={<ProductCategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* 404 Page Not Found Fallback */}
      <Route element={<Mainlayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
