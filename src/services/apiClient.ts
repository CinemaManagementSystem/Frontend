import axios from "axios";

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/api";

export function unwrapApiResponse<T>(
  payload: T | { data?: T; success?: boolean; message?: string },
): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    const value = (payload as { data?: T }).data;
    if (value !== undefined) return value as T;
  }

  return payload as T;
}

// One configured Axios instance every feature's own services/ imports from.
// Feature services should never call axios directly.
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

export function getApiErrorMessage(error: unknown, resource: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return `The ${resource} service is temporarily busy. Please wait a moment and try again.`;
    }

    const responseMessage = (
      error.response?.data as { message?: unknown } | undefined
    )?.message;
    if (typeof responseMessage === "string" && responseMessage.trim())
      return responseMessage;

    if (!error.response) {
      return `Unable to connect to the API. Make sure the backend is running at ${apiBaseUrl}.`;
    }

    return error.message || `Failed to load ${resource}.`;
  }

  return error instanceof Error ? error.message : `Failed to load ${resource}.`;
}

const PUBLIC_AUTH_URLS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

apiClient.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isPublicAuth = PUBLIC_AUTH_URLS.some(
    (p) => url.endsWith(p) || url.includes(`${p}/`),
  );
  if (isPublicAuth) return config;

  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use((response) => {
  if (response && response.data && typeof response.data === "object") {
    response.data = unwrapApiResponse(response.data);
  }
  return response;
});
