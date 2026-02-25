import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import * as inboxService from '../services/inbox.service'
import type { InboxItem, InboxNoteItem, BatchCluster } from '../types/inbox.types'

export function useInbox() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const userId = useAuthStore((s) => s.user?.id)
  const toast = useToastStore((s) => s.toast)

  const fetchInbox = useCallback(() => {
    inboxService.getInbox()
      .then((res) => { setItems(res.items); setTotalCount(res.total); setIsLoading(false) })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load inbox')
        setIsLoading(false)
      })
  }, [])

  useEffect(() => { fetchInbox() }, [fetchInbox])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel('inbox-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` }, fetchInbox)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suggestions', filter: `user_id=eq.${userId}` }, fetchInbox)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchInbox])

  const noteItems = useMemo(
    () => items.filter((i): i is InboxNoteItem => i.item_type === 'note'),
    [items],
  )

  const cluster = useMemo((): BatchCluster | null => {
    const candidates = noteItems.filter((n) => n.ai_suggested_bucket && (n.ai_confidence ?? 0) >= 0.7)
    const groups = new Map<string, string[]>()
    for (const n of candidates) {
      const key = n.ai_suggested_bucket!
      const ids = groups.get(key) ?? []
      ids.push(n.id)
      groups.set(key, ids)
    }
    for (const [bucketId, ids] of groups) {
      if (ids.length >= 3) {
        const note = candidates.find((n) => n.ai_suggested_bucket === bucketId)!
        return { bucketId, bucketPath: note.ai_suggested_bucket_path ?? bucketId, noteIds: ids, count: ids.length }
      }
    }
    return null
  }, [noteItems])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => prev.size === noteItems.length ? new Set() : new Set(noteItems.map((n) => n.id)))
  }, [noteItems])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])
  const toggleExpand = useCallback((id: string) => setExpandedId((prev) => (prev === id ? null : id)), [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
  }, [])

  const classifyNote = useCallback(async (noteId: string, bucketId: string) => {
    removeItem(noteId)
    try { await inboxService.classifyNote(noteId, bucketId); toast({ type: 'success', message: 'Note classified' }) }
    catch { toast({ type: 'error', message: 'Failed to classify' }) }
  }, [removeItem, toast])

  const batchClassify = useCallback(async (classifications: Array<{ note_id: string; bucket_id: string }>) => {
    for (const c of classifications) removeItem(c.note_id)
    try { await inboxService.batchClassify(classifications); toast({ type: 'success', message: `${classifications.length} notes classified` }) }
    catch { toast({ type: 'error', message: 'Batch classify failed' }) }
  }, [removeItem, toast])

  const archiveNote = useCallback(async (noteId: string) => {
    removeItem(noteId)
    try { await inboxService.archiveNote(noteId); toast({ type: 'success', message: 'Note archived' }) }
    catch { toast({ type: 'error', message: 'Failed to archive' }) }
  }, [removeItem, toast])

  const deleteNote = useCallback(async (noteId: string) => {
    removeItem(noteId)
    try { await inboxService.deleteNote(noteId); toast({ type: 'success', message: 'Note deleted' }) }
    catch { toast({ type: 'error', message: 'Failed to delete' }) }
  }, [removeItem, toast])

  const acceptSuggestion = useCallback(async (id: string) => {
    removeItem(id)
    try { await inboxService.acceptSuggestion(id); toast({ type: 'ai', message: 'Suggestion accepted' }) }
    catch { toast({ type: 'error', message: 'Failed to accept' }) }
  }, [removeItem, toast])

  const dismissSuggestion = useCallback(async (id: string) => {
    removeItem(id)
    try { await inboxService.dismissSuggestion(id); toast({ type: 'success', message: 'Suggestion dismissed' }) }
    catch { toast({ type: 'error', message: 'Failed to dismiss' }) }
  }, [removeItem, toast])

  return {
    items, totalCount, isLoading, error,
    selectedIds, focusedIndex, setFocusedIndex, expandedId,
    cluster, noteItems,
    toggleSelect, toggleAll, clearSelection, toggleExpand,
    classifyNote, batchClassify, archiveNote, deleteNote,
    acceptSuggestion, dismissSuggestion,
  }
}
