# Frontend Project Structure

Current reference for the ETEC cinema frontend. Reviewed 2026-09-12.

## Project profile

- React 18 + TypeScript + Vite.
- React Router for navigation.
- Zustand feature stores and Redux Toolkit CRUD state.
- Axios API access through `src/services/apiClient.ts`.
- Vitest, Testing Library, and JSDOM for tests.

## Runtime flow

```text
src/main.tsx -> src/app/provider.tsx -> src/App.tsx
-> src/routes/AppRoutes.tsx -> layout/page
-> store -> service -> src/services/apiClient.ts -> backend API
```

Services own HTTP calls. Components and pages should use stores, hooks, or services instead of calling Axios/fetch directly.

## Complete project inventory

All project files outside generated/dependency folders are listed below.

### Root and tooling

```text
.env                         local environment values; never commit secrets
.env.example                 environment template
.gitignore                   Git exclusions
agent_guide.md               root coding-agent guidance
api_guide.md                 API integration guidance
components.json              component generator configuration
eslint.config.js             ESLint configuration
index.html                   Vite HTML entry
package.json                 scripts and dependencies
package-lock.json            locked npm dependency graph
PROJECT_STRUCTURE.md         this document
README.md                    setup and project overview
tsconfig.json                TypeScript configuration
tsconfig.tsbuildinfo         TypeScript incremental build metadata
vite.config.ts               Vite and test configuration
public/favicon.ico           browser favicon
src/assets/logo.png          application logo
```

### Tool and IDE configuration

```text
.flowbite-react/.gitignore
.flowbite-react/class-list.json
.flowbite-react/config.json
.flowbite-react/init.tsx
.idea/.gitignore
.idea/Cenima-Project.iml
.idea/inspectionProfiles/Project_Default.xml
.idea/misc.xml
.idea/modules.xml
.idea/vcs.xml
.idea/workspace.xml
.vscode/extensions.json
.vscode/settings.json
```

`.github/` exists as a project configuration directory and currently contains no files.

### Application entry and app setup

```text
src/App.tsx                  root application component
src/main.tsx                 React DOM bootstrap
src/index.css                global styles and Tailwind layers
src/vite-env.d.ts            Vite TypeScript declarations
src/app/hooks.ts             typed Redux hooks
src/app/provider.tsx         application providers
src/app/store.ts             Redux store and CRUD reducer registry
```

### Shared components

```text
src/components/admin/CrudTable/CrudTable.tsx
src/components/common/Footer/Footer.tsx
src/components/common/Navbar/Navbar.css
src/components/common/Navbar/Navbar.tsx
src/components/common/Navbar/SearchAutocomplete.tsx
src/components/common/Sidebar/Sidebar.tsx
src/components/forms/LoginForm/LoginForm.tsx
src/components/forms/MovieForm/MovieForm.tsx
src/components/forms/RegisterForm/RegisterForm.tsx
src/components/ui/Alert/AlertDialog.tsx
src/components/ui/Alert/index.ts
src/components/ui/Badge/Badge.tsx
src/components/ui/Button/Button.tsx
src/components/ui/Card/MovieCard.tsx
src/components/ui/Input/Input.tsx
src/components/ui/Modal/Modal.tsx
src/components/ui/Spinner/Spinner.tsx
```

Admin contains reusable administration controls. Common contains site chrome. Forms contain reusable form screens. UI contains presentational primitives.

### Context, hooks, layouts, and libraries

```text
src/context/AuthContext.tsx
src/context/ThemeContext.tsx
src/hooks/useAuth.ts
src/hooks/useDebounce.ts
src/layouts/AuthLayout.tsx
src/layouts/DashboardLayout.tsx
src/layouts/Mainlayout.tsx
src/lib/authRole.ts
src/lib/authRole.test.ts
src/lib/devConsoleNoiseFilter.ts
src/lib/devConsoleNoiseFilter.test.ts
src/lib/paymentQr.ts
src/lib/paymentQr.test.ts
src/lib/utils.ts
```

### Documentation

```text
src/docs/01-project-structure.md
src/docs/02-folder-guidelines.md
src/docs/03-coding-conventions.md
src/docs/04-component-guidelines.md
src/docs/05-api-services.md
src/docs/06-animations-routing.md
src/docs/agent_guide.md
src/docs/APIEndpoint.md
src/docs/audit-log-api.md
src/docs/React_Request.md
```

### Pages

```text
src/pages/admin/AuditLogs/auditLogPreview.ts
src/pages/admin/AuditLogs/AuditLogsPage.test.tsx
src/pages/admin/AuditLogs/AuditLogsPage.tsx
src/pages/admin/BookingSeats/BookingSeatsPage.tsx
src/pages/admin/Bookings/BookingsPage.tsx
src/pages/admin/Categories/CategoriesPage.tsx
src/pages/admin/DashboardPage.tsx
src/pages/admin/Locations/LocationsPage.tsx
src/pages/admin/Movies/MoviesPage.tsx
src/pages/admin/OrderItems/OrderItemsPage.tsx
src/pages/admin/Orders/OrdersPage.tsx
src/pages/admin/Payments/PaymentsPage.tsx
src/pages/admin/PaymentTransactions/PaymentTransactionsPage.tsx
src/pages/admin/ProductCategories/ProductCategoriesPage.tsx
src/pages/admin/Products/ProductsPage.tsx
src/pages/admin/Screens/ScreensPage.tsx
src/pages/admin/Seats/SeatsPage.tsx
src/pages/admin/Shows/ShowsPage.tsx
src/pages/admin/Theaters/TheatersPage.tsx
src/pages/admin/Users/UsersPage.tsx
src/pages/auth/index.ts
src/pages/auth/Login/LoginPage.tsx
src/pages/auth/Register/RegisterPage.tsx
src/pages/auth/ResetPassword/ResetPassword.tsx
src/pages/public-site/Booking/BookingPage.tsx
src/pages/public-site/Booking/SnackImage.tsx
src/pages/public-site/Booking/SnackImage.test.tsx
src/pages/public-site/Cinemas/CinemasPage.tsx
src/pages/public-site/Cinemas/index.ts
src/pages/public-site/History/HistoryPage.tsx
src/pages/public-site/Home/HomePage.tsx
src/pages/public-site/Movies/MovieDetailPage.tsx
src/pages/public-site/Movies/MoviesPage.tsx
src/pages/public-site/NotFound/NotFoundPage.tsx
src/pages/public-site/NotFound/index.ts
src/pages/public-site/Offers/OffersPage.tsx
src/pages/public-site/Offers/index.ts
src/pages/public-site/Premiere/PremierePage.tsx
src/pages/public-site/Premiere/index.ts
src/pages/public-site/Settings/SettingsPage.tsx
src/pages/public-site/Settings/index.ts
src/pages/public-site/Showcase/ShowcasePage.tsx
```

`admin` contains protected management screens. `auth` contains login, registration, and password reset. `public-site` contains customer-facing cinema, movie, booking, history, offer, premiere, and settings screens.

### Routes and services

```text
src/routes/AppRoutes.tsx
src/routes/ProtectedRoute.tsx
src/services/apiClient.ts
src/services/auditLogService.ts
src/services/authService.ts
src/services/bookingAdminService.ts
src/services/bookingSeatService.ts
src/services/categoryService.ts
src/services/locationService.ts
src/services/movieAdminService.ts
src/services/orderItemService.ts
src/services/orderService.ts
src/services/paymentService.ts
src/services/paymentTransactionService.ts
src/services/productCategoryService.ts
src/services/productService.ts
src/services/screenService.ts
src/services/seatService.ts
src/services/showService.ts
src/services/theaterService.ts
src/services/userService.ts
```

`AppRoutes.tsx` is the authoritative route list. `ProtectedRoute.tsx` handles authenticated and role-restricted access. Each service owns API calls for its domain; `apiClient.ts` is the shared Axios instance/interceptor layer.

### State management

```text
src/store/authSlice.ts
src/store/authStore.ts
src/store/bookingAdminSlice.ts
src/store/bookingAdminStore.ts
src/store/bookingSeatSlice.ts
src/store/bookingSeatStore.ts
src/store/categorySlice.ts
src/store/categoryStore.ts
src/store/crudSlice.ts
src/store/locationSlice.ts
src/store/locationStore.ts
src/store/movieAdminSlice.ts
src/store/movieAdminStore.ts
src/store/movieSlice.ts
src/store/movieStore.ts
src/store/orderItemSlice.ts
src/store/orderItemStore.ts
src/store/orderSlice.ts
src/store/orderStore.ts
src/store/paymentSlice.ts
src/store/paymentStore.ts
src/store/paymentTransactionSlice.ts
src/store/paymentTransactionStore.ts
src/store/productCategorySlice.ts
src/store/productCategoryStore.ts
src/store/productSlice.ts
src/store/productStore.ts
src/store/screenSlice.ts
src/store/screenStore.ts
src/store/seatSlice.ts
src/store/seatStore.ts
src/store/showSlice.ts
src/store/showStore.ts
src/store/theaterSlice.ts
src/store/theaterStore.ts
src/store/userAdminSlice.ts
src/store/userAdminStore.ts
src/store/userSlice.ts
src/store/userStore.ts
```

The `*Store.ts` files are Zustand feature stores. The `*Slice.ts` files are Redux/CRUD feature slices. `authStore.ts` owns the current session and persisted auth user/token behavior. Check existing usage before introducing another global state pattern.

### Types, tests, and utilities

```text
src/types/admin.ts
src/types/api.d.ts
src/types/auditLog.ts
src/types/auth.ts
src/types/booking.ts
src/types/bookingApi.ts
src/types/bookingSeat.ts
src/types/category.ts
src/types/location.ts
src/types/movie.ts
src/types/movieApi.ts
src/types/order.ts
src/types/orderItem.ts
src/types/payment.ts
src/types/paymentTransaction.ts
src/types/product.ts
src/types/productCategory.ts
src/types/screen.ts
src/types/seat.ts
src/types/show.ts
src/types/theater.ts
src/types/user.ts
src/test/setup.ts
src/utils/formatCurrency.ts
src/utils/formatDate.ts
src/utils/__tests__/formatDate.test.ts
```

`src/types/` contains domain and API contracts. `src/utils/` contains formatting helpers. `src/test/setup.ts` configures Vitest and Testing Library. Focused tests are kept next to their implementation or in the utility `__tests__` directory.

## Rules for future changes

- Put route-level screens in `src/pages/`.
- Put reusable visual pieces in `src/components/`.
- Put backend requests in `src/services/` and use `apiClient.ts`.
- Put shared domain/API shapes in `src/types/`.
- Reuse the matching feature store in `src/store/`.
- Use `ProtectedRoute.tsx` for protected routes.
- Keep shared navigation and page chrome in layouts/common components.
- Run `npm run lint`, `npm run test`, and `npm run build` before handoff.

## Excluded generated or dependency folders

The following folders exist locally but are intentionally not inventoried as source files:

- `node_modules/` — installed dependencies, regenerated from `package-lock.json`.
- `dist/` — Vite build output, regenerated by `npm run build`.
- `.git/` — Git history and internal metadata.

Do not edit or commit these folders manually.
