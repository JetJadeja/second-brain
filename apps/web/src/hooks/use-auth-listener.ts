import { useEffect } from 'react'
import { getSupabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth-store'

export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    let supabase
    try {
      supabase = getSupabase()
    } catch {
      setSession(null)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      },
    )

    return () => subscription.unsubscribe()
  }, [setSession])
}
