# Cinematique Frontend

Cinematique is the React client for the Cinema Booking System. It provides the public movie-browsing and booking experience plus an authenticated administration console.

## Stack

- React 18, TypeScript, Vite
- React Router 6
- Zustand for feature state
- Axios for API access
- Tailwind CSS 4 and Motion for React
- Vitest and Testing Library

## Run locally

Requirements: Node.js 18+ and a running backend.

```bash
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`. Configure the backend base URL with `VITE_API_URL` in `.env`; the default is `/api`.

```bash
npm run build
npm run lint
npm test
```

## Authentication

`src/store/authStore.ts` calls `/auth/login` and `/auth/register` through `src/services/authService.ts`. A successful login persists:

- `token`: the JWT access token
- `auth_user`: the normalized user returned by the API

`src/services/apiClient.ts` reads `token` and sends `Authorization: Bearer <token>` on API requests. The current frontend does not use an HttpOnly cookie flow. The backend also supports `/auth/refresh` and `/auth/logout`; the current store exposes login, registration, and local logout only.

## Routes

Public pages use `MainLayout`; authentication pages use `AuthLayout`; administration pages use `DashboardLayout`.

| Area | Routes |
|---|---|
| Public | `/`, `/movies`, `/movies/:id`, `/showcase`, `/booking/:showtimeId`, `/history`, `/cinemas`, `/promotion`, `/fnb`, `/settings`, `/premiere`, `/membership`, `/coming-soon` |
| Auth | `/login`, `/register` |
| Admin | `/admin/dashboard`, `/admin/movie-categories`, `/admin/movies`, `/admin/locations`, `/admin/theaters`, `/admin/screens`, `/admin/seats`, `/admin/shows`, `/admin/bookings`, `/admin/booking-seats`, `/admin/product-categories`, `/admin/products`, `/admin/orders`, `/admin/order-items`, `/admin/payments`, `/admin/payment-transactions`, `/admin/users`, `/admin/audit-logs` |
| Redirects | `/admin` → `/admin/dashboard`, `/admin/security` → `/admin/audit-logs`, `/offers` → `/promotion`, legacy `/en/*` admin paths → `/admin/dashboard` |

Administrative access is rendered by `DashboardLayout` and each sensitive page performs its own auth/role check. Public browsing routes are intentionally available without login; booking/history behavior may still require an authenticated account.

## Project documentation

- [Project structure](PROJECT_STRUCTURE.md)
- [Agent and developer guide](agent_guide.md)
- [API guide](api_guide.md)
- [Detailed frontend docs](src/docs/)
- [Backend documentation](../Backend/src/main/doc/README.md)

Documentation describes the current source tree. If a document conflicts with code, verify the corresponding route, service, store, controller, or DTO before changing behavior.
