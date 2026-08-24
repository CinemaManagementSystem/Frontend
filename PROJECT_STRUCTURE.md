# Cinematique - Frontend Project Structure & Architecture

This project follows a scalable, modular folder structure suitable for production React applications. The structure strictly separates responsibilities into UI components, page views, API services, global state management (Zustand), layouts, custom hooks, and utilities.

---

# Complete Project Directory Tree

```text
Frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── auth.ts
│   │   ├── provider.ts
│   │   └── store.ts
│   │
│   ├── assets/
│   │   └── logo.png
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── index.ts
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── forms/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── index.ts
│   │   │   ├── MovieForm/
│   │   │   │   ├── MovieForm.tsx
│   │   │   │   └── index.ts
│   │   │   └── RegisterForm/
│   │   │       ├── RegisterForm.tsx
│   │   │       └── index.ts
│   │   │
│   │   └── ui/
│   │       ├── Badge/
│   │       │   ├── Badge.tsx
│   │       │   └── index.ts
│   │       ├── Card/
│   │       │   ├── MovieCard.tsx
│   │       │   └── index.ts
│   │       ├── Input/
│   │       │   ├── Input.tsx
│   │       │   └── index.ts
│   │       ├── Modal/
│   │       │   ├── Modal.tsx
│   │       │   └── index.ts
│   │       ├── Spinner/
│   │       │   ├── Spinner.tsx
│   │           └── index.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── docs/
│   │   ├── 01-project-structure.md
│   │   ├── 02-folder-guidelines.md
│   │   ├── 03-coding-conventions.md
│   │   ├── 04-component-guidelines.md
│   │   └── 05-api-services.md
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── Mainlayout.tsx
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Bookings/
│   │   │   │   ├── BookingsPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Movies/
│   │   │   │   ├── MoviesPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Users/
│   │   │   │   ├── UsersPage.tsx
│   │   │   │   └── index.ts
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── Login/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Register/
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── LoginForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── public-site/
│   │       ├── Booking/
│   │       │   ├── BookingPage.tsx
│   │       │   └── index.ts
│   │       ├── Cinemas/
│   │       │   ├── CinemasPage.tsx
│   │       │   └── index.ts
│   │       ├── History/
│   │       │   ├── HistoryPage.tsx
│   │       │   └── index.ts
│   │       ├── Home/
│   │       │   ├── HomePage.tsx
│   │       │   └── index.ts
│   │       └── Movies/
│   │           ├── MoviesPage.tsx
│   │           ├── MovieDetailPage.tsx
│   │           └── index.ts
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── services/
│   │   └── apiClient.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── movieStore.ts
│   │   └── userStore.ts
│   │
│   ├── types/
│   │   ├── admin.ts
│   │   ├── api.d.ts
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   └── movie.ts
│   │
│   ├── utils/
│   │   ├── __tests__/
│   │   ├── formatCurrency.ts
│   │   └── formatDate.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
│
├── .env
├── .env.example
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── PROJECT_STRUCTURE.md
├── README.md
├── tsconfig.json
└── vite.config.ts
```

---

# Directory Responsibilities & Structure

## `app/`
Contains root application bootstrapping, providers, and store initializations.
- `auth.ts`: Authentication initialization.
- `provider.ts`: Context & global provider composition.
- `store.ts`: Store export registry.

---

## `components/`
Organized into three strict subdirectories:
- **`common/`**: Application-wide layout structures (`Navbar`, `Footer`, `Sidebar`).
- **`forms/`**: Dedicated forms handling field validation (`LoginForm`, `MovieForm`, `RegisterForm`).
- **`ui/`**: Atomic, presentational, reusable UI primitives (`Badge`, `Card` / `MovieCard`, `Input`, `Modal`, `Spinner`, `button.tsx`, `card.tsx`).

---

## `layouts/`
Structural wrappers rendered by React Router containing `<Outlet />`:
- **`Mainlayout.tsx`**: Header Navbar, main scrollable content area (resets scroll on route transition), and Footer.
- **`DashboardLayout.tsx`**: Admin Sidebar navigation, header, and dashboard content view.
- **`AuthLayout.tsx`**: Centered card layout with cinematic background for Login and Register pages.

---

## `pages/`
Page views mapped to routes:

### `public-site/`
- **`Home/HomePage.tsx`**: Hero showcase banner, featured premiere, and cinema formats showcase section.
- **`Cinemas/CinemasPage.tsx`**: Showcase of premium formats and local theater locations (`/cinemas`).
- **`Movies/MoviesPage.tsx`**: Dedicated catalog page (`/movies`) with search by title/genre and category filters.
- **`Movies/MovieDetailPage.tsx`**: Single movie page (`/movies/:id`) with synopsis, trailer modal, date selector, and showtime listings.
- **`Booking/BookingPage.tsx`**: Interactive cinema seat grid selection, pricing calculator, and ticket confirmation (`/booking/:showtimeId`).
- **`History/HistoryPage.tsx`**: Ticket booking history list with QR codes (`/history`).

### `admin/`
- **`DashboardPage.tsx`**: Admin metrics overview, revenue stats, occupancy rates, and quick actions (`/admin/dashboard`).
- **`Movies/MoviesPage.tsx`**: Admin movie inventory management (add/edit/delete movies) (`/admin/movies`).
- **`Bookings/BookingsPage.tsx`**: Booking orders list and status management (`/admin/bookings`).
- **`Users/UsersPage.tsx`**: User account listing and role management (`/admin/users`).

### `auth/`
- **`Login/LoginPage.tsx`**: User login screen (`/login`).
- **`Register/RegisterPage.tsx`**: User registration screen (`/register`).

---

## `routes/`
- **`AppRoutes.tsx`**: Complete React Router route tree with public, auth, and admin route blocks.
- **`ProtectedRoute.tsx`**: Authentication and role-based route guard.

---

## `store/`
Zustand-powered global state stores:
- **`movieStore.ts`**: Movies state, category filtering, search query, showtime listings, and seat reservations.
- **`authStore.ts`**: Current user session, authentication status, login/logout, and demo role switching.
- **`userStore.ts`**: User administration state.

---

## `hooks/`
- **`useDebounce.ts`**: Debounces fast-changing state values.
- **`useAuth.ts`**: Auth helper hook.

---

## `services/`
- **`apiClient.ts`**: Configured Axios instance with automatic JWT Authorization header injection and base URL resolution.

---

## `types/`
- `movie.ts`: Movie and Showtime interfaces.
- `booking.ts`: Booking order, seat selection, and payment status types.
- `auth.ts`: User credentials and auth state types.
- `admin.ts`: Dashboard metrics and administrative types.
- `api.d.ts`: Generic API response definitions.

---

## `utils/` & `lib/`
- **`formatDate.ts`**: Date, time, and movie duration formatting.
- **`formatCurrency.ts`**: Currency ($ USD) formatting.
- **`lib/utils.ts`**: `cn()` utility combining `clsx` and `tailwind-merge`.

---

# Application Routing Table

| Route Path | Page Component | Layout | Access |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage` | `Mainlayout` | Public |
| `/movies` | `MoviesPage` | `Mainlayout` | Public |
| `/movies/:id` | `MovieDetailPage` | `Mainlayout` | Public |
| `/booking/:showtimeId` | `BookingPage` | `Mainlayout` | Public |
| `/history` | `HistoryPage` | `Mainlayout` | Public |
| `/login` | `LoginPage` | `AuthLayout` | Public / Guest |
| `/register` | `RegisterPage` | `AuthLayout` | Public / Guest |
| `/admin/dashboard` | `DashboardPage` | `DashboardLayout` | Admin |
| `/admin/movies` | `MoviesPage` (Admin) | `DashboardLayout` | Admin |
| `/admin/bookings` | `BookingsPage` | `DashboardLayout` | Admin |
| `/admin/users` | `UsersPage` | `DashboardLayout` | Admin |
| `*` | Redirect to `/` | — | Fallback |

---

# Architecture Flow

```text
User Event
    │
    ▼
React Router (AppRoutes.tsx)
    │
    ▼
Layout Component (Mainlayout / DashboardLayout / AuthLayout)
    │
    ▼
Page Component (e.g., MoviesPage, MovieDetailPage, BookingPage)
    │
    ▼
UI / Form Components (e.g., MovieCard, Navbar, Badge, Modal)
    │
    ▼
Zustand Store (movieStore.ts, authStore.ts)
    │
    ▼
API Service (apiClient.ts)
    │
    ▼
Backend API Endpoint
```