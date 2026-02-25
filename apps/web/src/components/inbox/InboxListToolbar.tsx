import { useState } from 'react'
import type { UnifiedInboxItem } from '../../lib/types'
import { Button } from '../ui/Button'
import { apiPost, apiDelete } from '../../lib/api-client'
import { useToastStore } from '../../stores/toast-store'

type NoteItem = Extract<UnifiedInboxItem, { kind: 'note' }>

interface InboxListToolbarProps {
  items: NoteItem[]
  selected: Set<string>
  onInvalidate: () => Promise<void>
}

export function InboxListToolbar({ items, selected, onInvalidate }: InboxListToolbarProps) {
  const addToast = useToastStore((s) => s.addToast)
  const [loading, setLoading] = useState(false)

  if (selected.size === 0) return null

  const handleBatchConfirm = async () => {
    const classifications = items
      .filter((i) => selected.has(i.data.id) && i.data.ai_suggested_bucket)
      .map((i) => ({ note_id: i.data.id, bucket_id: i.data.ai_suggested_bucket! }))
    if (classifications.length === 0) return
    setLoading(true)
    try {
      await apiPost('/api/inbox/batch-classify', { classifications })
      await onInvalidate()
      addToast(`${classifications.length} notes classified`)
    } catch {
      addToast('Failed to classify notes')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchArchive = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        [...selected].map((id) => apiPost(`/api/inbox/${id}/archive`)),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      await onInvalidate()
      if (failed > 0) addToast(`${selected.size - failed} archived, ${failed} failed`)
      else addToast(`${selected.size} notes archived`)
    } catch {
      addToast('Failed to archive notes')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        [...selected].map((id) => apiDelete(`/api/inbox/${id}`)),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      await onInvalidate()
      if (failed > 0) addToast(`${selected.size - failed} deleted, ${failed} failed`)
      else addToast(`${selected.size} notes deleted`)
    } catch {
      addToast('Failed to delete notes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded">
      <span className="text-sm text-text-secondary">{selected.size} selected</span>
      <Button variant="primary" className="text-xs px-3 py-1" onClick={handleBatchConfirm} disabled={loading}>
        Confirm as suggested
      </Button>
      <Button variant="secondary" className="text-xs px-3 py-1" onClick={handleBatchArchive} disabled={loading}>
        Archive all
      </Button>
      <Button variant="secondary" className="text-xs px-3 py-1 text-red-500" onClick={handleBatchDelete} disabled={loading}>
        Delete all
      </Button>
    </div>
  )
}
