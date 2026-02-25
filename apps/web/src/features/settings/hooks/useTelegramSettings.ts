import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import * as telegramService from '@/features/telegram/services/telegram.service'
import { settingsService } from '../services/settings.service'

type TelegramState =
  | { status: 'checking' }
  | { status: 'disconnected' }
  | { status: 'generating' }
  | { status: 'code-generated'; code: string; expiresAt: string }
  | { status: 'connected'; username: string | null }

const POLL_INTERVAL_MS = 3000

export function useTelegramSettings() {
  const toast = useToastStore((s) => s.toast)
  const userId = useAuthStore((s) => s.user?.id)
  const [state, setState] = useState<TelegramState>({ status: 'checking' })
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    pollRef.current = null
    channelRef.current = null
  }, [])

  useEffect(() => {
    if (!userId) return
    telegramService.getLinkStatus()
      .then((res) => {
        if (res.linked) {
          setState({ status: 'connected', username: res.telegram_username ?? null })
        } else {
          setState({ status: 'disconnected' })
        }
      })
      .catch(() => setState({ status: 'disconnected' }))
  }, [userId])

  useEffect(() => {
    if (state.status !== 'code-generated' || !userId) return
    channelRef.current = supabase
      .channel('telegram-settings-link')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'telegram_links',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const record = payload.new as { telegram_username?: string }
        cleanup()
        setState({ status: 'connected', username: record.telegram_username ?? null })
        toast({ type: 'success', message: 'Telegram connected' })
      })
      .subscribe()
    pollRef.current = setInterval(() => {
      telegramService.getLinkStatus().then((res) => {
        if (res.linked) {
          cleanup()
          setState({ status: 'connected', username: res.telegram_username ?? null })
          toast({ type: 'success', message: 'Telegram connected' })
        }
      }).catch(() => {})
    }, POLL_INTERVAL_MS)
    return cleanup
  }, [state.status, userId, cleanup, toast])

  const generateCode = useCallback(async () => {
    setState({ status: 'generating' })
    try {
      const res = await telegramService.generateLinkCode()
      setState({ status: 'code-generated', code: res.code, expiresAt: res.expires_at })
    } catch {
      setState({ status: 'disconnected' })
      toast({ type: 'error', message: 'Failed to generate code' })
    }
  }, [toast])

  const disconnect = useCallback(async () => {
    if (!confirmingDisconnect) {
      setConfirmingDisconnect(true)
      setTimeout(() => setConfirmingDisconnect(false), 3000)
      return
    }
    try {
      await settingsService.disconnectTelegram()
      setState({ status: 'disconnected' })
      setConfirmingDisconnect(false)
      toast({ type: 'success', message: 'Telegram disconnected' })
    } catch {
      toast({ type: 'error', message: 'Failed to disconnect' })
    }
  }, [confirmingDisconnect, toast])

  return { state, confirmingDisconnect, generateCode, disconnect }
}
