import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import * as telegramService from '../services/telegram.service'
import type { OnboardingState } from '../types/telegram.types'

const SKIP_KEY_PREFIX = 'telegram-onboarding-skipped-'
const POLL_INTERVAL_MS = 3000

export function useTelegramOnboarding() {
  const [state, setState] = useState<OnboardingState>({ status: 'checking' })
  const userId = useAuthStore((s) => s.user?.id)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    pollRef.current = null
    channelRef.current = null
  }, [])

  // Initial check
  useEffect(() => {
    if (!userId) return
    const skipped = localStorage.getItem(`${SKIP_KEY_PREFIX}${userId}`) === 'true'
    if (skipped) {
      setState({ status: 'hidden' })
      return
    }
    telegramService.getLinkStatus()
      .then((res) => {
        setState(res.linked ? { status: 'hidden' } : { status: 'initial' })
      })
      .catch(() => setState({ status: 'hidden' }))
  }, [userId])

  // Realtime + polling when code-generated
  useEffect(() => {
    if (state.status !== 'code-generated' || !userId) return

    const handleConnected = (username: string | null) => {
      cleanup()
      setState({ status: 'connected', username })
    }

    channelRef.current = supabase
      .channel('telegram-link')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'telegram_links',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const record = payload.new as { telegram_username?: string }
        handleConnected(record.telegram_username ?? null)
      })
      .subscribe()

    pollRef.current = setInterval(() => {
      telegramService.getLinkStatus().then((res) => {
        if (res.linked) {
          handleConnected(res.linked ? (res.telegram_username ?? null) : null)
        }
      }).catch(() => {})
    }, POLL_INTERVAL_MS)

    return cleanup
  }, [state.status, userId, cleanup])

  // Auto-dismiss after connected
  useEffect(() => {
    if (state.status !== 'connected') return
    const timer = setTimeout(() => setState({ status: 'dismissing' }), 1700)
    return () => clearTimeout(timer)
  }, [state.status])

  const generateCode = useCallback(async () => {
    setState({ status: 'generating' })
    try {
      const res = await telegramService.generateLinkCode()
      setState({ status: 'code-generated', code: res.code, expiresAt: res.expires_at })
    } catch {
      setState({ status: 'initial' })
    }
  }, [])

  const skip = useCallback(() => {
    if (userId) localStorage.setItem(`${SKIP_KEY_PREFIX}${userId}`, 'true')
    setState({ status: 'dismissing' })
  }, [userId])

  return { state, generateCode, skip }
}
