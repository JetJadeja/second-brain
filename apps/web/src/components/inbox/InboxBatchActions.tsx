import { useState } from 'react'
import type { InboxItem } from '../../lib/types'
import { Button } from '../ui/Button'
import { ParaPicker } from '../para/ParaPicker'
import { apiPost, apiDelete } from '../../lib/api-client'
import { useToastStore } from '../../stores/toast-store'

interface InboxBatchActionsProps {
  items: InboxItem[]
  selected: Set<string>
  selectedCount: number
  onComplete: () => void
}

export function InboxBatchActions({ items, selected, selectedCount, onComplete }: InboxBatchActionsProps) {
  const [showClassifyPicker, setShowClassifyPicker] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const handleBatchConfirm = async () => {
    const withSuggestion = items.filter((i) => selected.has(i.id) && i.ai_suggested_bucket)
    const skipped = selectedCount - withSuggestion.length
    const classifications = withSuggestion.map((i) => ({ note_id: i.id, bucket_id: i.ai_suggested_bucket! }))
    if (classifications.length === 0) {
      addToast('None of the selected items had an AI suggestion')
      return
    }
    try {
      await apiPost('/api/inbox/batch-classify', { classifications })
      if (skipped > 0) {
        addToast(`Confirmed ${classifications.length} of ${selectedCount} — ${skipped} had no suggestion`)
      }
      onComplete()
    } catch {
      addToast('Failed to confirm items')
    }
  }

  const handleBatchClassify = async (bucketId: string, _bucketPath: string) => {
    setShowClassifyPicker(false)
    const classifications = [...selected].map((id) => ({ note_id: id, bucket_id: bucketId }))
    try {
      await apiPost('/api/inbox/batch-classify', { classifications })
      onComplete()
    } catch {
      addToast('Failed to classify items')
    }
  }

  const handleBatchArchive = async () => {
    try {
      for (const id of selected) {
        await apiPost(`/api/inbox/${id}/archive`)
      }
      onComplete()
    } catch {
      addToast('Failed to archive items')
    }
  }

  const handleBatchDelete = async () => {
    try {
      for (const id of selected) {
        await apiDelete(`/api/inbox/${id}`)
      }
      onComplete()
    } catch {
      addToast('Failed to delete items')
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded">
      <span className="text-sm text-text-secondary">{selectedCount} selected</span>
      <Button variant="primary" className="text-xs px-3 py-1" onClick={handleBatchConfirm}>
        Confirm as suggested
      </Button>
      <div className="relative">
        <Button variant="secondary" className="text-xs px-3 py-1" onClick={() => setShowClassifyPicker(!showClassifyPicker)}>
          Classify selected
        </Button>
        {showClassifyPicker && (
          <ParaPicker onSelect={handleBatchClassify} onClose={() => setShowClassifyPicker(false)} />
        )}
      </div>
      <Button variant="secondary" className="text-xs px-3 py-1" onClick={handleBatchArchive}>
        Archive all
      </Button>
      <Button variant="secondary" className="text-xs px-3 py-1 text-red-500" onClick={handleBatchDelete}>
        Delete all
      </Button>
    </div>
  )
}
