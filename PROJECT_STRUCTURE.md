# Frontend project structure

The frontend is a Vite React application organized by responsibility and feature.

    src/
    ├── app/                  # application hooks, providers, and Redux store registry
    ├── components/
    │   ├── admin/            # reusable administration components
    │   ├── common/           # Navbar, Sidebar, Footer
    │   ├── forms/            # login, registration, and movie forms
    │   └── ui/               # presentational primitives
    ├── context/              # authentication/theme contexts
    ├── docs/                 # frontend documentation
    ├── hooks/                # reusable React hooks
    ├── layouts/              # MainLayout, AuthLayout, DashboardLayout
    ├── lib/                  # small cross-feature helpers and tests
    ├── pages/                # auth, admin, and public-site pages
    ├── routes/               # AppRoutes and legacy route handling
    ├── services/             # Axios-backed feature services
    ├── store/                # Zustand feature stores and slices
    ├── types/                # API/domain TypeScript types
    └── utils/                # formatting helpers and tests

## Runtime flow

    Browser event
      → React Router (src/routes/AppRoutes.tsx)
      → layout and page
      → feature store
      → feature service
      → apiClient.ts
      → Spring Boot API

apiClient.ts is the only Axios instance. Services own HTTP calls; components should not call Axios or fetch directly.

## State

authStore.ts owns the current session and persists token and auth_user. Each domain has a service, types, and usually a Zustand store/slice pair: movies, locations, theaters, screens, seats, shows, bookings, products, orders, payments, payment transactions, categories, and users.

src/app/store.ts also contains the Redux store registry used by CRUD resource slices. Do not introduce a second global state pattern inside a feature without checking existing usage.

## Routing

See src/docs/06-animations-routing.md and api_guide.md. The route list in src/routes/AppRoutes.tsx is authoritative.

