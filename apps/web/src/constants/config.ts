export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  INBOX_PAGE_SIZE: 20,
  NOTES_PAGE_SIZE: 20,
} as const

export const DEBOUNCE = {
  SEARCH_MS: 150,
} as const
