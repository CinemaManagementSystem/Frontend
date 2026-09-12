# Cinematique frontend agent guide

## Purpose

Cinematique is the web client for a cinema booking platform. It supports public movie discovery, showtime and seat booking screens, customer history, authentication, and an administration console.

## Source of truth

Before changing documentation or code, check:

- routes in src/routes/AppRoutes.tsx
- session behavior in src/store/authStore.ts
- API transport in src/services/apiClient.ts
- domain services in src/services/
- DTO shapes in src/types/
- backend controllers and DTOs in ../Backend/src/main/java/com/cinema/booking/

## Rules

- Use TypeScript and the existing @/* path alias.
- Keep HTTP requests in src/services/ and use the configured apiClient.
- Keep state in the relevant feature store/slice.
- Keep UI primitives presentational; do not import Axios or feature stores into components/ui.
- Update the relevant type whenever an API shape changes.
- Handle loading, empty, error, and fallback-image states for asynchronous UI.
- Use the existing Tailwind 4 theme and the red Cinematique accent (#E50914).
- Use Motion only for opacity/transform/filter transitions and honor useReducedMotion().
- Preserve API role and ownership checks; client-side checks are presentation safeguards, not authorization.
- Run npm run lint, npm run build, and relevant Vitest tests after changes.

## Authentication

Login accepts one principal: an email or username. The store calls POST /auth/login, normalizes the returned role, and stores the JWT in localStorage.token. The normalized user is stored in localStorage.auth_user. The API client sends a Bearer header. Registration calls POST /auth/register and does not log the user in automatically.

## Roles and pages

Roles are ADMIN, STAFF, and USER. The admin navigation is available to ADMIN and STAFF users, while sensitive pages such as user management and audit logs require ADMIN. The backend remains the authority for API authorization.

## Important limitation

The audit-log page supports a clearly labeled in-memory sample preview. Real audit data is opt-in through VITE_AUDIT_LOG_API_PATH; the backend currently has no audit-log controller or event recorder.

