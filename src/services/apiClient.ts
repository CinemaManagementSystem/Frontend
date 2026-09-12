import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/api'

// One configured Axios instance every feature's own services/ imports from.
// Feature services should never call axios directly.
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

export function getApiErrorMessage(error: unknown, resource: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) {
      return `The ${resource} service is temporarily busy. Please wait a moment and try again.`
    }

    const responseMessage = (error.response?.data as { message?: unknown } | undefined)?.message
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage

    if (!error.response) {
      return `Unable to connect to the API. Make sure the backend is running at ${apiBaseUrl}.`
    }

    return error.message || `Failed to load ${resource}.`
  }

  return error instanceof Error ? error.message : `Failed to load ${resource}.`
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('auth_user')

      if (!window.location.pathname.startsWith('/login')) {
        const returnTo = `${window.location.pathname}${window.location.search}`
        window.location.assign(`/login?redirect=${encodeURIComponent(returnTo)}`)
      }
    }

    return Promise.reject(error)
  },
)
