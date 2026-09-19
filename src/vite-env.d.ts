/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_AUDIT_LOG_API_PATH?: string
  readonly VITE_BOOKING_HOLD_MINUTES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
