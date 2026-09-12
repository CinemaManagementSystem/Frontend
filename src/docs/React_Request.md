# Frontend request flow

The current implementation uses a JWT Bearer header.

    Login/Register page
      → authStore
      → authService.login/register
      → apiClient
      → POST /api/auth/login or /api/auth/register
      → backend returns JSON
      → authStore stores token and auth_user in localStorage

    Any feature service
      → apiClient request interceptor
      → Authorization: Bearer <token>
      → Spring Security JWT filter
      → controller → service → repository

The current frontend does not implement the older HttpOnly-cookie flow. Refresh and server-side logout endpoints exist in the backend, but the current authStore does not call them automatically.

