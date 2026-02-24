import { useState } from 'react'
import type { InboxItem } from '../../lib/types'
import { formatRelativeTime, formatFullDate } from '../../lib/format-time'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'
import { Button } from '../ui/Button'
import { apiPost, apiDelete } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface InboxListProps {
  items: InboxItem[]
  onActionComplete: () => void
}

export function InboxList({ items, onActionComplete }: InboxListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()

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
    const classifications = items
      .filter((i) => selected.has(i.id) && i.ai_suggested_bucket)
      .map((i) => ({ note_id: i.id, bucket_id: i.ai_suggested_bucket! }))
    if (classifications.length === 0) return
    await apiPost('/api/inbox/batch-classify', { classifications })
    await invalidateAll()
  }

  const handleBatchArchive = async () => {
    for (const id of selected) {
      await apiPost(`/api/inbox/${id}/archive`)
    }
    await invalidateAll()
  }

  const handleBatchDelete = async () => {
    for (const id of selected) {
      await apiDelete(`/api/inbox/${id}`)
    }
    await invalidateAll()
  }

  return (
    <div className="flex flex-col gap-4">
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded">
          <span className="text-sm text-text-secondary">{selected.size} selected</span>
          <Button variant="primary" className="text-xs px-3 py-1" onClick={handleBatchConfirm}>
            Confirm as suggested
          </Button>
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
                <Chip label={item.ai_suggested_bucket_path} truncate />
              )}
            </div>
            <span className="text-xs text-text-tertiary w-24" title={formatFullDate(item.captured_at)}>
              {formatRelativeTime(item.captured_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
