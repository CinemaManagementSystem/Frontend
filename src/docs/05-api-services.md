# API services

Use the single Axios instance in src/services/apiClient.ts. It resolves VITE_API_URL or defaults to /api, adds the Bearer token from localStorage.token, and provides common error-message handling.

Each domain service owns its endpoint paths and typed calls. Examples include authService, movieAdminService, productService, paymentService, and auditLogService. Pages and UI components call store actions or service-backed hooks rather than Axios directly.

Keep JSON requests as JSON. Product create/update uses multipart form data for the optional image upload. Treat the backend response and authorization rules as authoritative, and update the matching src/types contract when a DTO changes.

