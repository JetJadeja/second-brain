import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import * as dashboardService from '../services/dashboard.service'
import type { DashboardData } from '../types/dashboard.types'

type UseDashboardReturn = {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
  classifyNote: (noteId: string, bucketId: string) => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userId = useAuthStore((s) => s.user?.id)
  const toast = useToastStore((s) => s.toast)

  useEffect(() => {
    dashboardService.getDashboard()
      .then((res) => {
        setData(res)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard'
        setError(message)
        setIsLoading(false)
      })
  }, [])

  // Realtime: new inbox items
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('dashboard-notes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notes',
        filter: `user_id=eq.${userId}`,
      }, () => {
        setData((prev) => {
          if (!prev) return prev
          return { ...prev, inbox: { ...prev.inbox, count: prev.inbox.count + 1 } }
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const classifyNote = useCallback(async (noteId: string, bucketId: string) => {
    try {
      await dashboardService.classifyNote(noteId, bucketId)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          inbox: {
            count: Math.max(0, prev.inbox.count - 1),
            recent: prev.inbox.recent.filter((item) => item.id !== noteId),
          },
        }
      })
      toast({ type: 'success', message: 'Note classified' })
    } catch {
      toast({ type: 'error', message: 'Failed to classify note' })
    }
  }, [toast])

  return { data, isLoading, error, classifyNote }
}
