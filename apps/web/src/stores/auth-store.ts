import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  initializing: boolean
  setSession: (session: Session | null) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  initializing: true,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, initializing: false })
  },

  signIn: async (email, password) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  signUp: async (email, password) => {
    const { data, error } = await getSupabase().auth.signUp({ email, password })

    if (error) return { error: error.message }

    if (data.user && data.user.identities?.length === 0) {
      return { error: 'An account with this email already exists.' }
    }

    return { error: null }
  },

  signOut: async () => {
    const { error } = await getSupabase().auth.signOut()
    return { error: error?.message ?? null }
  },
}))
