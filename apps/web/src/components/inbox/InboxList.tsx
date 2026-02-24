import { useState } from 'react'
import type { UnifiedInboxItem } from '../../lib/types'
import { formatRelativeTime, formatFullDate } from '../../lib/format-time'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'
import { Lightbulb } from 'lucide-react'
import { InboxListToolbar } from './InboxListToolbar'
import { apiPost } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../stores/toast-store'

interface InboxListProps {
  items: UnifiedInboxItem[]
  onActionComplete: () => void
}

export function InboxList({ items, onActionComplete }: InboxListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  const noteItems = items.filter((i): i is Extract<UnifiedInboxItem, { kind: 'note' }> => i.kind === 'note')

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === noteItems.length) setSelected(new Set())
    else setSelected(new Set(noteItems.map((i) => i.data.id)))
  }

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inbox'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['para-tree'] }),
    ])
    setSelected(new Set())
    onActionComplete()
  }

  const handleSuggestionAction = async (id: string, action: 'accept' | 'dismiss') => {
    try {
      await apiPost(`/api/suggestions/${id}/${action}`)
      await invalidateAll()
      addToast(action === 'accept' ? 'Suggestion accepted' : 'Suggestion dismissed')
    } catch {
      addToast(`Failed to ${action} suggestion`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <InboxListToolbar
        items={noteItems}
        selected={selected}
        onInvalidate={invalidateAll}
      />

      <div className="border border-border rounded overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2 bg-hover/50 border-b border-border">
          <input type="checkbox" checked={selected.size === noteItems.length && noteItems.length > 0} onChange={toggleAll} className="rounded" />
          <span className="text-xs font-medium text-text-tertiary flex-1">Title</span>
          <span className="text-xs font-medium text-text-tertiary w-48">Info</span>
          <span className="text-xs font-medium text-text-tertiary w-24">Date</span>
        </div>
        {items.map((item) =>
          item.kind === 'note' ? (
            <div key={item.data.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-hover/30">
              <input type="checkbox" checked={selected.has(item.data.id)} onChange={() => toggleSelect(item.data.id)} className="rounded" />
              <SourceIcon source={item.data.source_type} />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-text-primary truncate block">{item.data.title}</span>
                {item.data.ai_summary && <span className="text-xs text-text-tertiary truncate block">{item.data.ai_summary}</span>}
              </div>
              <div className="w-48">
                {item.data.ai_suggested_bucket_path && <Chip label={item.data.ai_suggested_bucket_path} truncate />}
              </div>
              <span className="text-xs text-text-tertiary w-24" title={formatFullDate(item.data.captured_at)}>
                {formatRelativeTime(item.data.captured_at)}
              </span>
            </div>
          ) : (
            <div key={item.data.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-hover/30">
              <div className="w-4" />
              <Lightbulb size={14} className="text-yellow-500" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-text-primary truncate block">{item.data.description}</span>
              </div>
              <div className="w-48 flex gap-2">
                <button type="button" className="text-xs text-btn-primary hover:underline" onClick={() => handleSuggestionAction(item.data.id, 'accept')}>Accept</button>
                <button type="button" className="text-xs text-text-tertiary hover:underline" onClick={() => handleSuggestionAction(item.data.id, 'dismiss')}>Dismiss</button>
              </div>
              <span className="text-xs text-text-tertiary w-24" title={formatFullDate(item.data.created_at)}>
                {formatRelativeTime(item.data.created_at)}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
