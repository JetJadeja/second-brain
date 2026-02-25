import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

  const itemsRef = useRef(items)
  itemsRef.current = items

  const fetchInbox = useCallback(() => {
    inboxService.getInbox()
      .then((res) => {
        const mapped = res.items.map((item: Record<string, unknown>): InboxItem => {
          const raw = item as { kind: string; data: Record<string, unknown> }
          if (raw.kind === 'suggestion') {
            const d = raw.data as { id: string; type: string; payload: Record<string, unknown>; description: string; created_at: string }
            return { item_type: 'suggestion', id: d.id, type: d.type, payload: d.payload, description: d.description, created_at: d.created_at }
          }
          const d = raw.data as InboxNoteItem
          return { ...d, item_type: 'note' }
        })
        setItems(mapped)
        setTotalCount(res.total)
        setIsLoading(false)
      })
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

  const restoreItem = useCallback((item: InboxItem, index: number) => {
    setItems((prev) => {
      const next = [...prev]
      next.splice(Math.min(index, next.length), 0, item)
      return next
    })
    setTotalCount((prev) => prev + 1)
  }, [])

  const optimisticAction = useCallback(
    (id: string, apiCall: () => Promise<void>, successMsg: string, errorMsg: string, successType: 'success' | 'ai' = 'success') => {
      const idx = itemsRef.current.findIndex((i) => i.id === id)
      const snapshot = idx !== -1 ? itemsRef.current[idx] : null
      removeItem(id)
      return apiCall()
        .then(() => toast({ type: successType, message: successMsg }))
        .catch(() => {
          if (snapshot) restoreItem(snapshot, idx)
          toast({ type: 'error', message: errorMsg })
        })
    },
    [removeItem, restoreItem, toast],
  )

  const classifyNote = useCallback(
    (noteId: string, bucketId: string) =>
      optimisticAction(noteId, () => inboxService.classifyNote(noteId, bucketId), 'Note classified', 'Failed to classify — note restored'),
    [optimisticAction],
  )

  const batchClassify = useCallback(async (classifications: Array<{ note_id: string; bucket_id: string }>) => {
    const ids = new Set(classifications.map((c) => c.note_id))
    const snapshots = itemsRef.current
      .map((item, index) => ({ item, index }))
      .filter((s) => ids.has(s.item.id))
    for (const c of classifications) removeItem(c.note_id)
    try {
      await inboxService.batchClassify(classifications)
      toast({ type: 'success', message: `${classifications.length} notes classified` })
    } catch {
      for (const s of snapshots.reverse()) restoreItem(s.item, s.index)
      toast({ type: 'error', message: 'Batch classify failed — notes restored' })
    }
  }, [removeItem, restoreItem, toast])

  const archiveNote = useCallback(
    (noteId: string) =>
      optimisticAction(noteId, () => inboxService.archiveNote(noteId), 'Note archived', 'Failed to archive — note restored'),
    [optimisticAction],
  )

  const deleteNote = useCallback(
    (noteId: string) =>
      optimisticAction(noteId, () => inboxService.deleteNote(noteId), 'Note deleted', 'Failed to delete — note restored'),
    [optimisticAction],
  )

  const acceptSuggestion = useCallback(async (id: string) => {
    const idx = itemsRef.current.findIndex((i) => i.id === id)
    const snapshot = idx !== -1 ? itemsRef.current[idx] : null
    removeItem(id)
    try {
      const { affected_note_ids } = await inboxService.acceptSuggestion(id)
      for (const noteId of affected_note_ids) removeItem(noteId)
      toast({ type: 'ai', message: 'Suggestion accepted' })
    } catch {
      if (snapshot) restoreItem(snapshot, idx)
      toast({ type: 'error', message: 'Failed to accept — restored' })
    }
  }, [removeItem, restoreItem, toast])

  const dismissSuggestion = useCallback(
    (id: string) =>
      optimisticAction(id, () => inboxService.dismissSuggestion(id), 'Suggestion dismissed', 'Failed to dismiss — restored'),
    [optimisticAction],
  )

  return {
    items, totalCount, isLoading, error,
    selectedIds, focusedIndex, setFocusedIndex, expandedId,
    cluster, noteItems,
    toggleSelect, toggleAll, clearSelection, toggleExpand,
    classifyNote, batchClassify, archiveNote, deleteNote,
    acceptSuggestion, dismissSuggestion,
  }
}
