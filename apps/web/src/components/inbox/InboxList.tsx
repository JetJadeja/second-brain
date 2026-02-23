import { useState } from 'react'
import type { InboxItem } from '../../lib/types'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'
import { Button } from '../ui/Button'
import { ParaPicker } from '../para/ParaPicker'
import { apiPost, apiDelete } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../stores/toast-store'

interface InboxListProps {
  items: InboxItem[]
  onActionComplete: () => void
}

export function InboxList({ items, onActionComplete }: InboxListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showClassifyPicker, setShowClassifyPicker] = useState(false)
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inbox'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ])
    setSelected(new Set())
    onActionComplete()
  }

  const handleBatchConfirm = async () => {
    const withSuggestion = items.filter((i) => selected.has(i.id) && i.ai_suggested_bucket)
    const skipped = selected.size - withSuggestion.length
    const classifications = withSuggestion.map((i) => ({ note_id: i.id, bucket_id: i.ai_suggested_bucket! }))
    if (classifications.length === 0) {
      addToast('None of the selected items had an AI suggestion')
      return
    }
    try {
      await apiPost('/api/inbox/batch-classify', { classifications })
      if (skipped > 0) {
        addToast(`Confirmed ${classifications.length} of ${selected.size} — ${skipped} had no suggestion`)
      }
      await invalidateAll()
    } catch {
      addToast('Failed to confirm items')
    }
  }

  const handleBatchArchive = async () => {
    try {
      for (const id of selected) {
        await apiPost(`/api/inbox/${id}/archive`)
      }
      await invalidateAll()
    } catch {
      addToast('Failed to archive items')
    }
  }

  const handleBatchDelete = async () => {
    try {
      for (const id of selected) {
        await apiDelete(`/api/inbox/${id}`)
      }
      await invalidateAll()
    } catch {
      addToast('Failed to delete items')
    }
  }

  const handleBatchClassify = async (bucketId: string, _bucketPath: string) => {
    setShowClassifyPicker(false)
    const classifications = [...selected].map((id) => ({ note_id: id, bucket_id: bucketId }))
    try {
      await apiPost('/api/inbox/batch-classify', { classifications })
      await invalidateAll()
    } catch {
      addToast('Failed to classify items')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded">
          <span className="text-sm text-text-secondary">{selected.size} selected</span>
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
      )}

      <div className="border border-border rounded overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 bg-hover/50 border-b border-border">
          <input type="checkbox" checked={selected.size === items.length} onChange={toggleAll} className="rounded" />
          <span className="text-xs font-medium text-text-tertiary flex-1">Title</span>
          <span className="text-xs font-medium text-text-tertiary w-48">Suggested</span>
          <span className="text-xs font-medium text-text-tertiary w-24">Captured</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-hover/30">
            <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
            <SourceIcon source={item.source_type} />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text-primary truncate block">{item.title}</span>
              {item.ai_summary && (
                <span className="text-xs text-text-tertiary truncate block">{item.ai_summary}</span>
              )}
            </div>
            <div className="w-48">
              {item.ai_suggested_bucket_path && (
                <Chip label={item.ai_suggested_bucket_path} />
              )}
            </div>
            <span className="text-xs text-text-tertiary w-24">{item.captured_at}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
