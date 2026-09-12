# Frontend agent guide

The canonical frontend agent guidance is in ../../agent_guide.md.

This file remains in src/docs for existing links. The current source uses React 18, TypeScript, Vite, React Router 6, Zustand feature stores, Axios services, Tailwind CSS 4, and Motion for React.

Before changing code, verify routes in src/routes/AppRoutes.tsx, authentication in src/store/authStore.ts, transport in src/services/apiClient.ts, feature services in src/services/, and contracts in src/types/. Keep HTTP calls in services, use the @/* alias, keep UI primitives presentational, preserve the existing theme, and treat backend authorization as authoritative.

The current login flow stores a JWT access token in localStorage.token and the normalized user in localStorage.auth_user. The audit-log page is sample-only unless VITE_AUDIT_LOG_API_PATH points to a future backend endpoint.

