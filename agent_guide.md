# 🤖 Cinematique - Comprehensive AI Agent & Developer Guide

> **Version:** 1.0.0  
> **Target Audience:** AI Coding Assistants (Antigravity, Claude, ChatGPT, Cursor, Copilot) & Human Engineers  
> **Last Updated:** August 2026  
> **Project Root:** `Frontend/`

---

## 📑 Table of Contents

1. [Executive Summary & Project Mission](#1-executive-summary--project-mission)
2. [Technology Stack & Core Dependencies](#2-technology-stack--core-dependencies)
3. [Repository Architecture & Directory Tree](#3-repository-architecture--directory-tree)
4. [Layer Responsibilities & Boundary Rules](#4-layer-responsibilities--boundary-rules)
5. [Coding Conventions & Implementation Standards](#5-coding-conventions--implementation-standards)
6. [Design System, Theme Tokens & Styling Guidelines](#6-design-system-theme-tokens--styling-guidelines)
7. [Routing Architecture & Navigation Map](#7-routing-architecture--navigation-map)
8. [Global State Management (Zustand)](#8-global-state-management-zustand)
9. [API Services & Backend Integration Specification](#9-api-services--backend-integration-specification)
10. [Animation Guidelines (`motion/react`)](#10-animation-guidelines-motionreact)
11. [Testing & Quality Assurance](#11-testing--quality-assurance)
12. [AI Agent Operating Instructions & Do's / Don'ts](#12-ai-agent-operating-instructions--dos--donts)

---

## 1. Executive Summary & Project Mission

**Cinematique** is an enterprise-grade, modern cinema discovery and ticket booking web application. It delivers a premium, dark-mode cinematic user experience featuring real-time seat reservation, interactive seat grids, showtime scheduling, multi-format theater showcases (IMAX, Dolby Atmos, VIP Recliners), user ticket history with scannable QR passes, role-based authentication, and a full-featured admin management dashboard (metrics, movie CRUD, bookings, and user administration).

The frontend communicates with a Spring Boot 3 REST API backend configured with Spring Security, JWT authentication, KHQR & Cash payment processing, and Cloudinary media storage.

---

## 2. Technology Stack & Core Dependencies

| Category | Technology | Version | Purpose / Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | [React](https://react.dev/) | `^18.3.1` (19 ready) | Core UI library using Functional Components & Hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `~5.6.3` | Strict type safety across all layers |
| **Bundler & Tooling** | [Vite](https://vitejs.dev/) | `^6.0.7` | Fast HMR dev server & optimized production build |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^6.30.4` | Client-side routing with nested layouts and route guards |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | `^5.0.2` | Minimalist, high-performance global state stores |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.3` | Utility-first styling via `@tailwindcss/vite` & `@theme` |
| **UI Components** | [Flowbite React](https://flowbite-react.com/) / [shadcn](https://ui.shadcn.com/) | `^0.12` / `^4.13` | Accessible UI primitives and components |
| **Icons** | [Lucide React](https://lucide.dev/) | `^1.25.0` | Modern SVG iconography |
| **Animations** | [Motion](https://motion.dev/) (`motion/react`) | `^13.1.1` | Smooth spring-physics and entrance/exit animations |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.7.9` | HTTP requests with JWT request interceptors |
| **Typography** | `@fontsource-variable/geist` | `^5.3.0` | Clean, modern sans-serif typography |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library | `^2.1.8` | Unit and integration test runner |

---

## 3. Repository Architecture & Directory Tree

```text
Frontend/
├── public/                     # Static public assets (favicons, manifest)
├── src/
│   ├── app/                    # Root bootstrap & registry
│   │   ├── auth.ts             # Auth initialization
│   │   ├── provider.ts         # Provider composition
│   │   └── store.ts            # Store exports registry
│   │
│   ├── assets/                 # Bundled static media (logo.png, format icons)
│   │
│   ├── components/             # Reusable UI component library
│   │   ├── common/             # Global structural components
│   │   │   ├── Footer/         # App footer with links & newsletter
│   │   │   ├── Navbar/         # Main navbar with navigation & user profile
│   │   │   └── Sidebar/        # Admin navigation sidebar
│   │   ├── forms/              # Self-contained form components with validation
│   │   │   ├── LoginForm/      # Login credentials form
│   │   │   ├── MovieForm/      # Admin add/edit movie modal form
│   │   │   └── RegisterForm/   # Account registration form
│   │   └── ui/                 # Atomic presentational UI primitives
│   │       ├── Badge/          # Status and genre badges
│   │       ├── Button/         # Styled action buttons
│   │       ├── Card/           # MovieCard and content card wrappers
│   │       ├── Input/          # Form input fields with validation states
│   │       ├── Modal/          # Overlay modal dialogs
│   │       └── Spinner/        # Loading spinners and progress indicators
│   │
│   ├── context/                # React context providers
│   │   ├── AuthContext.tsx     # Context-level auth fallback
│   │   └── ThemeContext.tsx    # Theme provider
│   │
│   ├── docs/                   # Developer documentation & API contracts
│   │   ├── 01-project-structure.md
│   │   ├── 02-folder-guidelines.md
│   │   ├── 03-coding-conventions.md
│   │   ├── 04-component-guidelines.md
│   │   ├── 05-api-services.md
│   │   ├── 06-animations-routing.md
│   │   ├── APIEndpoint.md      # Full REST API endpoint specification
│   │   └── React_Request.md    # Spring Security authentication flow diagram
│   │
│   ├── hooks/                  # Custom reusable React hooks
│   │   ├── useAuth.ts          # Auth helper hook
│   │   └── useDebounce.ts      # Input & search query debounce hook
│   │
│   ├── layouts/                # Structural layout wrappers with <Outlet />
│   │   ├── AuthLayout.tsx      # Centered card layout with cinematic background
│   │   ├── DashboardLayout.tsx # Admin dashboard sidebar & header layout
│   │   └── Mainlayout.tsx      # Public site header, auto-scroll, & footer layout
│   │
│   ├── lib/
│   │   └── utils.ts            # cn() class helper (clsx + tailwind-merge)
│   │
│   ├── pages/                  # Routed page view components
│   │   ├── admin/              # Management views
│   │   │   ├── Bookings/       # Customer reservation management (/admin/bookings)
│   │   │   ├── Movies/         # Movie inventory CRUD (/admin/movies)
│   │   │   ├── Users/          # User directory & role controls (/admin/users)
│   │   │   └── DashboardPage.tsx # Analytics KPI summary (/admin/dashboard)
│   │   ├── auth/               # Authentication views
│   │   │   ├── Login/          # Sign-in page (/login)
│   │   │   └── Register/       # Sign-up page (/register)
│   │   └── public-site/        # Customer-facing views
│   │       ├── Booking/        # Interactive seat reservation (/booking/:showtimeId)
│   │       ├── Cinemas/        # Formats & theater showcase (/cinemas)
│   │       ├── History/        # Booking history & QR tickets (/history)
│   │       ├── Home/           # Hero banner & catalog highlights (/)
│   │       ├── Movies/         # Movies catalog & Movie details (/movies, /movies/:id)
│   │       ├── Offers/         # Promotions & discounts (/offers)
│   │       ├── Premiere/       # VIP membership & coming soon (/premiere)
│   │       └── NotFound/       # 404 Error page with recovery CTA (*)
│   │
│   ├── routes/                 # Routing engine
│   │   ├── AppRoutes.tsx       # Main route declarations & redirects
│   │   └── ProtectedRoute.tsx  # Role-based route guard
│   │
│   ├── services/               # HTTP client & external API endpoints
│   │   └── apiClient.ts        # Axios client with JWT request interceptor
│   │
│   ├── store/                  # Zustand global state stores
│   │   ├── authStore.ts        # User credentials, JWT token, role toggle
│   │   ├── movieStore.ts       # Movie catalog, categories, search, seat map state
│   │   └── userStore.ts        # Admin user management state
│   │
│   ├── types/                  # TypeScript domain interfaces & types
│   │   ├── admin.ts            # Dashboard KPI metrics & admin actions
│   │   ├── api.d.ts            # Generic API responses & error interfaces
│   │   ├── auth.ts             # User profiles, auth states, and payloads
│   │   ├── booking.ts          # Seats, bookings, showtimes, and ticket types
│   │   └── movie.ts            # Movie model, genres, cast, formats
│   │
│   ├── utils/                  # Pure utility functions
│   │   ├── __tests__/          # Vitest unit test suites
│   │   ├── formatCurrency.ts   # USD currency formatter ($0.00)
│   │   └── formatDate.ts       # Dates, times, and duration formatters
│   │
│   ├── App.tsx                 # Root application wrapper
│   ├── main.tsx                # React DOM entry point
│   ├── index.css               # Tailwind CSS v4 design system tokens
│   └── vite-env.d.ts           # Vite client environment declarations
│
├── .env                        # Local environment variables
├── .env.example                # Example environment configuration
├── components.json             # shadcn component configuration
├── eslint.config.js            # ESLint flat configuration
├── index.html                  # HTML5 entry page
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration with @/ alias
└── vite.config.ts              # Vite configuration
```

---

## 4. Layer Responsibilities & Boundary Rules

To maintain high code quality, follow these strict architectural boundary rules:

| Directory | Primary Purpose | Contains Business Logic? | Direct API Calls? | Imports Zustand Store? |
| :--- | :--- | :---: | :---: | :---: |
| `src/components/ui/` | Pure atomic presentational primitives | ❌ No | ❌ No | ❌ **Forbidden** |
| `src/components/forms/` | Self-contained forms with input validation | ⚠️ Form state only | ❌ No (via callback/store) | ⚠️ Optional |
| `src/components/common/`| Global navigation (Navbar, Footer, Sidebar) | ⚠️ Navigation state | ❌ No | ✅ Read-only auth/role |
| `src/layouts/` | Page layout structures (`<Outlet />`) | ⚠️ UI framing only | ❌ No | ✅ Read-only auth |
| `src/pages/` | Routed full-screen views & controllers | ✅ Yes | ⚠️ Via Stores/Services | ✅ Yes |
| `src/store/` | Zustand global state management | ✅ Yes | ✅ Via `src/services/` | N/A (Is Store) |
| `src/services/` | API communication client | ❌ No | ✅ **Yes (Axios)** | ❌ No |
| `src/hooks/` | Stateful reusable hooks | ✅ Yes | ⚠️ Via Store/Service | ✅ Yes |
| `src/utils/` | Pure mathematical / string formatters | ❌ Pure functions | ❌ No | ❌ No |
| `src/types/` | TypeScript interfaces and types | ❌ Types only | ❌ No | ❌ No |

---

## 5. Coding Conventions & Implementation Standards

### 5.1 Naming Conventions

- **React Components:** PascalCase file and export (`MovieCard.tsx`, `HomePage.tsx`).
- **Custom Hooks:** camelCase prefixed with `use` (`useDebounce.ts`, `useAuth.ts`).
- **Zustand Stores:** camelCase with `Store` suffix (`movieStore.ts`, `authStore.ts`).
- **Utility / Service Files:** camelCase (`formatDate.ts`, `apiClient.ts`).
- **TypeScript Types & Interfaces:** PascalCase (`Movie`, `Showtime`, `SeatType`).
- **Constants / Enum Values:** `UPPER_SNAKE_CASE` (`DEFAULT_SEAT_PRICE`, `MAX_SEATS_PER_BOOKING`).

### 5.2 Path Aliases

Always use the configured `@/` path alias instead of relative imports:

```tsx
// ✅ Correct
import { useMovieStore } from '@/store/movieStore';
import { MovieCard } from '@/components/ui/Card/MovieCard';
import { cn } from '@/lib/utils';

// ❌ Incorrect
import { useMovieStore } from '../../../../store/movieStore';
```

### 5.3 Component Architecture Template

Every React component should follow this structured blueprint:

```tsx
import React, { useState } from 'react';
import { LucideIcon, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie } from '@/types/movie';

// 1. Explicit Props Interface
export interface MovieCardProps {
  movie: Movie;
  className?: string;
  onSelect?: (id: string) => void;
}

// 2. Component Declaration
export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  className,
  onSelect,
}) => {
  // 3. Local UI State
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // 4. Event Handlers
  const handleCardClick = () => {
    onSelect?.(movie.id);
  };

  // 5. JSX Render
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-zinc-900/80 border border-white/10 p-4 transition-all duration-300 hover:border-red-600/50 hover:shadow-xl hover:shadow-red-600/10',
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-72 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <h3 className="mt-3 text-lg font-bold text-white group-hover:text-red-500 transition-colors">
        {movie.title}
      </h3>
    </div>
  );
};
```

---

## 6. Design System, Theme Tokens & Styling Guidelines

The application employs a dark cinematic palette configured via **Tailwind CSS v4** in `src/index.css`.

### 6.1 Theme Color Tokens

| Variable | Value | Usage |
| :--- | :--- | :--- |
| `--primary` / `--accent` | `#E50914` | Cinema Red (Primary buttons, active tabs, highlights) |
| `--background` | `#0f0f10` | App background body color |
| `--card` | `#141416` | Container and card background |
| `--popover` | `#1a1a1e` | Dropdowns, tooltips, floating menus |
| `--secondary` | `#222226` | Secondary buttons and badges |
| `--border` | `rgba(255, 255, 255, 0.1)` | Subtle card borders and dividers |
| `--sidebar` | `#101012` | Admin sidebar background |
| `--muted-foreground`| `#9ca3af` | Secondary subtitle and metadata text |

### 6.2 Pre-defined CSS Utilities

- **`.glass-panel`**:
  ```css
  background-color: rgba(26, 26, 26, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```
- **`.glass-nav`**:
  ```css
  background-color: rgba(18, 18, 20, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  ```
- **`.screen-curve`**:
  ```css
  height: 20px;
  border-top: 4px solid #E50914;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  box-shadow: 0 -8px 24px -2px rgba(229, 9, 20, 0.4);
  ```

---

## 7. Routing Architecture & Navigation Map

The routing table is declared in `src/routes/AppRoutes.tsx`.

### 7.1 Complete Route Specification

| Route Path | Page Component | Layout | Required Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `HomePage` | `Mainlayout` | Public | Hero showcase, trending movies, formats preview |
| `/movies` | `MoviesPage` (Public) | `Mainlayout` | Public | Full movie catalog with search & category filters |
| `/movies/:id` | `MovieDetailPage` | `Mainlayout` | Public | Movie synopsis, trailer modal, date & showtimes |
| `/booking/:showtimeId` | `BookingPage` | `Mainlayout` | Public / User | Interactive seat grid, price calculator & checkout |
| `/history` | `HistoryPage` | `Mainlayout` | Public / User | User ticket history & scannable QR passes |
| `/cinemas` | `CinemasPage` | `Mainlayout` | Public | Premium cinema formats (IMAX, 3D, Dolby) & locations |
| `/offers` | `OffersPage` | `Mainlayout` | Public | Special promotions, discounts, and combo deals |
| `/premiere` | `PremierePage` | `Mainlayout` | Public | VIP Membership perks and coming soon films |
| `/login` | `LoginPage` | `AuthLayout` | Guest / Public | Sign-in screen with quick role demo switcher |
| `/register` | `RegisterPage` | `AuthLayout` | Guest / Public | Sign-up screen with role selection |
| `/admin` | Redirect -> `/admin/dashboard` | — | Admin | Route redirect helper |
| `/admin/dashboard` | `DashboardPage` | `DashboardLayout` | Admin / Staff | Admin KPI metrics, revenue charts, quick actions |
| `/admin/movies` | `MoviesPage` (Admin) | `DashboardLayout` | Admin / Staff | Movie catalog inventory CRUD table & modals |
| `/admin/bookings` | `BookingsPage` | `DashboardLayout` | Admin / Staff | Ticket reservations and status management |
| `/admin/users` | `UsersPage` | `DashboardLayout` | Admin | User accounts directory and role administration |
| `*` | `NotFoundPage` | `Mainlayout` | Public | Global 404 catch-all with Home CTA |

---

## 8. Global State Management (Zustand)

Global state is orchestrated via **Zustand** stores located in `src/store/`.

### 8.1 Store Architecture

1. **`authStore.ts`**:
   - `user`: Current user object (`id`, `name`, `email`, `role`, `avatar`).
   - `isAuthenticated`: Boolean status.
   - `token`: JWT authentication token.
   - Actions: `login()`, `logout()`, `toggleRole()` (switches between `ADMIN` and `USER` for live demo testing).

2. **`movieStore.ts`**:
   - `movies`: List of all loaded movie models.
   - `selectedCategory`: Active category filter (`all`, `action`, `sci-fi`, `drama`, etc.).
   - `searchQuery`: Debounced movie search term.
   - `showtimes`: Showtime schedules by movie and date.
   - `reservedSeats`: Real-time seat reservation map for the active booking session.
   - Actions: `setMovies()`, `setSelectedCategory()`, `setSearchQuery()`, `reserveSeats()`, `addMovie()`, `updateMovie()`, `deleteMovie()`.

3. **`userStore.ts`**:
   - `users`: Registered users list.
   - Actions: `setUsers()`, `updateUserRole()`, `deleteUser()`.

### 8.2 Zustand Selective Subscription Rule

To prevent unnecessary re-renders across the component tree, **always destructure only the specific slices needed**:

```tsx
// ✅ Correct (Only re-renders when searchQuery or setSearchQuery changes)
const searchQuery = useMovieStore((state) => state.searchQuery);
const setSearchQuery = useMovieStore((state) => state.setSearchQuery);

// ❌ Incorrect (Re-renders on ANY store update)
const store = useMovieStore();
```

---

## 9. API Services & Backend Integration Specification

### 9.1 Core HTTP Client (`src/services/apiClient.ts`)

```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 9.2 Backend REST API Reference

The backend exposes the following RESTful resource controllers:

| Domain | Base Path | Key Methods | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/auth` | `POST /login`, `POST /register` | JWT auth & user onboarding |
| **Movie Categories**| `/api/movie-category` | `GET`, `POST`, `PUT`, `DELETE` | Movie genre/category management |
| **Movies** | `/api/movies` | `GET`, `POST`, `PUT`, `DELETE` | Film inventory & synopsis management |
| **Locations** | `/api/locations` | `GET`, `POST`, `PUT`, `DELETE` | City / cinema locations |
| **Theaters** | `/api/theaters` | `GET`, `POST`, `PUT`, `DELETE` | Theater complex details |
| **Screens** | `/api/screens` | `GET`, `POST`, `PUT`, `DELETE` | Cinema hall / screen management |
| **Seats** | `/api/seats` | `GET`, `POST`, `PUT`, `DELETE` | Seat configuration (Regular, VIP, Couple) |
| **Showtimes** | `/api/shows` | `GET`, `POST`, `PUT`, `DELETE` | Movie screening schedules |
| **Bookings** | `/api/bookings` | `GET`, `POST`, `PUT`, `DELETE` | Ticket orders & reservations |
| **Booking Seats** | `/api/booking-seats` | `GET`, `POST`, `PUT`, `DELETE` | Individual reserved seats |
| **Concessions** | `/api/products` | `GET`, `POST`, `PUT`, `DELETE` | Food & drink items (Cloudinary images) |
| **Payments** | `/api/payments` | `GET`, `POST`, `POST .../confirm` | Supports `CASH` and `KHQR` with status polling |
| **Transactions** | `/api/payment-transactions` | `GET`, `POST` | Payment gateway transaction audit logs |
| **Users** | `/api/users` | `GET`, `POST`, `PUT`, `DELETE` | Admin user account management |

---

## 10. Animation Guidelines (`motion/react`)

We use `motion/react` (Motion) for fluid, GPU-accelerated micro-interactions:

1. **Duration & Easing:**
   - Standard transitions: `duration: 0.25s` to `0.35s` with `ease: "easeOut"`.
   - Modals & dialogs: Spring physics (`type: "spring"`, `stiffness: 300`, `damping: 25`).
2. **Transform Restrictions:**
   - Only animate `opacity`, `transform` (`x`, `y`, `scale`), and `filter`.
   - Avoid animating layout triggers (`width`, `height`, `margin`, `top`, `left`).
3. **Reduced Motion:**
   - Honor accessibility settings with `useReducedMotion()`.

---

## 11. Testing & Quality Assurance

- **Framework:** [Vitest](https://vitest.dev/) with `@testing-library/react` and `jsdom`.
- **Test Scripts:**
  - `npm run test` (single execution)
  - `npm run test:watch` (interactive test watcher)
  - `npm run lint` (ESLint static code check)
  - `npm run build` (TypeScript typecheck + Vite bundle compilation)

---

## 12. AI Agent Operating Instructions & Do's / Don'ts

When working as an AI pair programmer or autonomous coding agent on this repository, strictly adhere to these rules:

### ✅ DO's

1. **Use Path Aliases:** Always use `@/...` for internal imports.
2. **Follow Existing Patterns:** Match the style of existing components (`MovieCard.tsx`, `BookingPage.tsx`, `Mainlayout.tsx`).
3. **Preserve Glassmorphism Theme:** Use `.glass-panel`, `.glass-nav`, `border-white/10`, and `#E50914` accents.
4. **Keep UI Components Pure:** Never import Zustand stores or Axios inside `src/components/ui/`.
5. **Update TypeScript Definitions:** If a new model attribute is introduced, update interfaces in `src/types/`.
6. **Graceful Fallbacks:** Provide fallback images, mock data defaults, and loading states for any async operation.

### ❌ DON'Ts

1. **DO NOT** make direct `axios` or `fetch` calls directly inside React components or UI primitives. Always route through `src/services/` and `src/store/`.
2. **DO NOT** install alternative CSS libraries (no Bootstrap, Chakra UI, Vanilla Emotion). Use Tailwind CSS v4.
3. **DO NOT** hardcode API URLs. Always reference `import.meta.env.VITE_API_URL` via `apiClient.ts`.
4. **DO NOT** remove or alter existing documentation files without maintaining backwards consistency.
