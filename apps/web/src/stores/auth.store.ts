import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import * as authService from '@/features/auth/services/auth.service'

type AuthStore = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  async initialize(): Promise<void> {
    const session = await authService.getSession()
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isLoading: false,
    })

    authService.onAuthStateChange((newSession) => {
      const typedSession = newSession as Session | null
      set({
        session: typedSession,
        user: typedSession?.user ?? null,
        isAuthenticated: typedSession !== null,
      })
    })
  },

  async signOut(): Promise<void> {
    await authService.signOut()
    set({ user: null, session: null, isAuthenticated: false })
  },
}))
