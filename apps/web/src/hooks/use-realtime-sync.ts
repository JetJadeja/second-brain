import { useEffect } from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { getSupabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth-store'

export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id ?? null)

  useEffect(() => {
    if (!userId) return

    const supabase = getSupabase()

    const channel = supabase
      .channel(`realtime-sync-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        () => onNoteInsert(queryClient),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        () => onNoteChange(queryClient),
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
        () => onNoteChange(queryClient),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'para_buckets', filter: `user_id=eq.${userId}` },
        () => onBucketChange(queryClient),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'telegram_links', filter: `user_id=eq.${userId}` },
        () => onLinkChange(queryClient),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, userId])
}

function onNoteInsert(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: ['dashboard'] })
  qc.invalidateQueries({ queryKey: ['inbox'] })
}

function onNoteChange(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: ['dashboard'] })
  qc.invalidateQueries({ queryKey: ['inbox'] })
  qc.invalidateQueries({ queryKey: ['para-tree'] })
  qc.invalidateQueries({ queryKey: ['bucket'] })
  qc.invalidateQueries({ queryKey: ['note'] })
}

function onBucketChange(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: ['para-tree'] })
  qc.invalidateQueries({ queryKey: ['dashboard'] })
  qc.invalidateQueries({ queryKey: ['bucket'] })
}

function onLinkChange(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: ['link-status'] })
}
