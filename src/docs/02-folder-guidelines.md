# Folder guidelines

- components/ui: reusable presentational primitives; no API calls or feature-store imports.
- components/common: site-wide navigation, footer, sidebar, and shared widgets.
- components/forms: reusable form fields and validation wiring.
- pages: route-level composition. Pages may use their feature store and service-backed actions.
- layouts: structural wrappers containing React Router Outlet.
- services: all HTTP calls through apiClient.
- store: feature state, loading/error state, and CRUD actions.
- types: request, response, and view-model contracts.
- hooks: reusable React behavior.
- lib and utils: pure helpers and focused tests.
- docs: implementation guidance; keep it synchronized with routes and services.

Use the existing feature naming and @/* path alias. Avoid adding a parallel folder or state-management pattern when an existing feature already covers the domain.

