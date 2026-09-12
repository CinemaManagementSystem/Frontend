# Animations and routing

## Routing

Routes are composed in src/routes/AppRoutes.tsx:

- public pages render inside MainLayout
- login and registration render inside AuthLayout
- admin pages render inside DashboardLayout
- /admin redirects to /admin/dashboard
- /admin/security redirects to /admin/audit-logs
- /offers redirects to /promotion
- unknown routes render NotFoundPage

The current public booking and history routes are not wrapped by the unused legacy ProtectedRoute; pages and API ownership checks handle access where needed.

## Motion

Use motion/react for short opacity/transform transitions. Prefer roughly 150–350ms ease-out transitions and spring motion for dialogs. Do not animate layout-triggering width/height/margin properties when a transform will work. Use useReducedMotion() so essential content remains usable without animation.

