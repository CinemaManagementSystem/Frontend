import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/Mainlayout';
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
import { SettingsPage } from '@/pages/public-site/Settings';

// Auth Pages
import { LoginPage } from '@/pages/auth/Login/LoginPage';
import { RegisterPage } from '@/pages/auth/Register/RegisterPage';

// Admin Pages
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { CategoriesPage } from '@/pages/admin/Categories/CategoriesPage';
import { CreateCategoryPage } from '@/pages/admin/Categories/CreateCategoryPage';
import { MoviesPage } from '@/pages/admin/Movies/MoviesPage';
import { CreateMoviePage } from '@/pages/admin/Movies/CreateMoviePage';
import { LocationsPage } from '@/pages/admin/Locations/LocationsPage';
import { CreateLocationPage } from '@/pages/admin/Locations/CreateLocationPage';
import { TheatersPage } from '@/pages/admin/Theaters/TheatersPage';
import { CreateTheaterPage } from '@/pages/admin/Theaters/CreateTheaterPage';
import { ScreensPage } from '@/pages/admin/Screens/ScreensPage';
import { CreateScreenPage } from '@/pages/admin/Screens/CreateScreenPage';
import { SeatsPage } from '@/pages/admin/Seats/SeatsPage';
import { CreateSeatPage } from '@/pages/admin/Seats/CreateSeatPage';
import { ShowsPage } from '@/pages/admin/Shows/ShowsPage';
import { CreateShowPage } from '@/pages/admin/Shows/CreateShowPage';
import { BookingsPage } from '@/pages/admin/Bookings/BookingsPage';
import { CreateBookingPage } from '@/pages/admin/Bookings/CreateBookingPage';
import { BookingSeatsPage } from '@/pages/admin/BookingSeats/BookingSeatsPage';
import { CreateBookingSeatPage } from '@/pages/admin/BookingSeats/CreateBookingSeatPage';
import { ProductCategoriesPage } from '@/pages/admin/ProductCategories/ProductCategoriesPage';
import { CreateProductCategoryPage } from '@/pages/admin/ProductCategories/CreateProductCategoryPage';
import { ProductsPage } from '@/pages/admin/Products/ProductsPage';
import { CreateProductPage } from '@/pages/admin/Products/CreateProductPage';
import { OrdersPage } from '@/pages/admin/Orders/OrdersPage';
import { CreateOrderPage } from '@/pages/admin/Orders/CreateOrderPage';
import { OrderItemsPage } from '@/pages/admin/OrderItems/OrderItemsPage';
import { CreateOrderItemPage } from '@/pages/admin/OrderItems/CreateOrderItemPage';
import { PaymentsPage } from '@/pages/admin/Payments/PaymentsPage';
import { CreatePaymentPage } from '@/pages/admin/Payments/CreatePaymentPage';
import { PaymentTransactionsPage } from '@/pages/admin/PaymentTransactions/PaymentTransactionsPage';
import { CreatePaymentTransactionPage } from '@/pages/admin/PaymentTransactions/CreatePaymentTransactionPage';
import { UsersPage } from '@/pages/admin/Users/UsersPage';
import { CreateUserPage } from '@/pages/admin/Users/CreateUserPage';
import { AuditLogsPage } from '@/pages/admin/AuditLogs/AuditLogsPage';
import { SettingsPage as AdminSettingsPage } from '@/pages/admin/Settings';
import { ShowcasePage } from '@/pages/public-site/Showcase/ShowcasePage';
import { PaymentGatewayPage } from '@/pages/public-site/Payment/PaymentGatewayPage';
import { OrderConfirmationPage } from '@/pages/public-site/Payment/OrderConfirmationPage';
import { useAuthStore } from '@/store/authStore';
import { canAccessAdmin } from '@/lib/authRole';

const CustomerOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && canAccessAdmin(user?.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Site Layout & Routes */}
      <Route
        element={
          <CustomerOnlyRoute>
            <MainLayout />
          </CustomerOnlyRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<PublicMoviesPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/booking/:showtimeId" element={<BookingPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/cinemas" element={<CinemasPage />} />
        <Route path="/promotion" element={<OffersPage />} />
        <Route path="/fnb" element={<OffersPage />} />
        <Route path="/offers" element={<Navigate to="/promotion" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/premiere" element={<PremierePage />} />
        <Route path="/membership" element={<PremierePage />} />
        <Route path="/premiere-circle" element={<PremierePage />} />
        <Route path="/coming-soon" element={<PremierePage />} />
        <Route path="/payment-gateway" element={<PaymentGatewayPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
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
        <Route path="movie-categories/create" element={<CreateCategoryPage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/create" element={<CreateMoviePage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="locations/create" element={<CreateLocationPage />} />
        <Route path="theaters" element={<TheatersPage />} />
        <Route path="theaters/create" element={<CreateTheaterPage />} />
        <Route path="screens" element={<ScreensPage />} />
        <Route path="screens/create" element={<CreateScreenPage />} />
        <Route path="seats" element={<SeatsPage />} />
        <Route path="seats/create" element={<CreateSeatPage />} />
        <Route path="shows" element={<ShowsPage />} />
        <Route path="shows/create" element={<CreateShowPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/create" element={<CreateBookingPage />} />
        <Route path="booking-seats" element={<BookingSeatsPage />} />
        <Route path="booking-seats/create" element={<CreateBookingSeatPage />} />
        <Route path="product-categories" element={<ProductCategoriesPage />} />
        <Route path="product-categories/create" element={<CreateProductCategoryPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/create" element={<CreateOrderPage />} />
        <Route path="order-items" element={<OrderItemsPage />} />
        <Route path="order-items/create" element={<CreateOrderItemPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="payments/create" element={<CreatePaymentPage />} />
        <Route path="payment-transactions" element={<PaymentTransactionsPage />} />
        <Route path="payment-transactions/create" element={<CreatePaymentTransactionPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/create" element={<CreateUserPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="security" element={<Navigate to="/admin/audit-logs" replace />} />
      </Route>

      {/* 404 Page Not Found Fallback */}
      <Route
        element={
          <CustomerOnlyRoute>
            <MainLayout />
          </CustomerOnlyRoute>
        }
      >
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
