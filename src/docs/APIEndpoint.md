# API endpoints

The backend base URL is http://localhost:8081 by default; frontend services use configured VITE_API_URL. Authentication is Bearer JWT.

| Resource | Endpoints | Access summary |
|---|---|---|
| Auth | POST /api/auth/register, /login, /refresh, /logout | Register/login/refresh are public; logout revokes the supplied token |
| Movies | GET/POST/PUT/DELETE /api/movies | GET public; create/update STAFF or ADMIN; delete ADMIN |
| Categories | /api/movie-category, /api/product-categories | Movie-category GET public; writes STAFF or ADMIN |
| Cinemas | /api/locations, /api/theaters | GET public; writes STAFF or ADMIN; deletes ADMIN |
| Rooms | /api/screens, /api/seats | Authenticated reads; STAFF/ADMIN writes; deletes ADMIN |
| Shows | /api/shows | Authenticated reads; STAFF/ADMIN writes and deletes |
| Bookings | /api/bookings, /api/booking-seats | Authenticated; ownership is enforced by the service |
| Products | /api/products | Authenticated reads; STAFF/ADMIN multipart writes |
| Orders | /api/orders, /api/order-items | Authenticated; ownership is enforced by the service |
| Payments | /api/payments | Authenticated create/read/update; confirm STAFF/ADMIN; current delete service allows owner/STAFF/ADMIN |
| Transactions | /api/payment-transactions | Reads authenticated; writes STAFF/ADMIN |
| Users | /api/users | ADMIN only |
| Audit logs | No backend endpoint currently | Frontend sample preview only; optional future API via VITE_AUDIT_LOG_API_PATH |

All resource controllers provide collection and ID endpoints unless noted. Product create/update consumes multipart/form-data. Swagger is available at /swagger-ui/index.html when the backend is running.

