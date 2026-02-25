import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export type AuthCredentials = {
  email: string
  password: string
}

export type AuthResult = {
  success: boolean
  error?: string
}
