# Frontend API integration guide

## Base URL and authentication

The frontend uses src/services/apiClient.ts. It resolves VITE_API_URL or defaults to /api. Every feature service imports this client. The request interceptor reads localStorage.token and sends Authorization: Bearer <token>. The current client does not use HttpOnly cookies.

The backend runs on http://localhost:8081 by default. A common local setup is:

    VITE_API_URL=http://localhost:8081/api

Feature service paths are relative to the base URL, so /auth/login becomes http://localhost:8081/api/auth/login.

## Backend resources

| Resource | API path |
|---|---|
| Authentication | /auth/register, /auth/login, /auth/refresh, /auth/logout |
| Movie categories | /movie-category |
| Movies | /movies |
| Locations and theaters | /locations, /theaters |
| Screens and seats | /screens, /seats |
| Shows | /shows |
| Bookings | /bookings, /booking-seats |
| Products | /product-categories, /products |
| Orders | /orders, /order-items |
| Payments | /payments, /payments/{id}/status, /payments/{id}/confirm |
| Payment transactions | /payment-transactions |

Products use multipart/form-data for create/update because an optional image file may be uploaded. Other documented requests use JSON unless the backend controller says otherwise.

## API conventions

- Successful list responses are arrays.
- Creates return 201; updates return 200; deletes return 204.
- Backend Long IDs are numbers in frontend types.
- Dates use ISO-compatible strings.
- Backend errors are mapped to user-facing messages by getApiErrorMessage.
- A 429 response is temporary; do not retry aggressively.

## Service pattern

A page obtains data through its domain store. A store calls a service such as movieService, paymentService, or productService; the service calls apiClient. Keep endpoint paths and request/response mapping in the service/type layer.

For the complete endpoint and role matrix, see src/docs/APIEndpoint.md.

