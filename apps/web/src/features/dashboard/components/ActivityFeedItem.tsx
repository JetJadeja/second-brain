import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SourceIcon } from '@/components/shared/SourceIcon'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { noteRoute } from '@/constants/routes'
import type { FeedItem } from '../types/dashboard.types'

type ActivityFeedItemProps = {
  item: FeedItem
  onClassify?: (noteId: string, bucketId: string) => void
}

export function ActivityFeedItem({ item, onClassify }: ActivityFeedItemProps) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (item.type === 'suggestion') {
    return (
      <div className="flex items-center gap-3 h-16 px-4 border-b border-surface-200 border-l-[3px] border-l-ember-500">
        <Sparkles size={16} className="text-ember-500 shrink-0" />
        <p className="flex-1 font-body text-surface-500 truncate">{item.text}</p>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setDismissed(true)} className="font-body-sm text-surface-300 hover:text-surface-400 transition-colors">Dismiss</button>
          <button className="font-body-sm text-ember-500 hover:text-ember-600 transition-colors">Open</button>
        </div>
      </div>
    )
  }

  const isCapture = item.type === 'capture'
  const note = item.item
  const handleClick = () => { if (!isCapture) navigate(noteRoute(note.id)) }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 h-16 px-4 border-b border-surface-200',
        isCapture && 'border-l-[3px] border-l-ember-500',
        !isCapture && 'cursor-pointer hover:bg-surface-100/50',
      )}
    >
      <SourceIcon sourceType={note.source_type} size={16} className="shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-title-sm text-surface-700 truncate">{note.title}</p>
        {note.ai_summary && (
          <p className="font-body-sm text-surface-400 truncate">{note.ai_summary}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs text-surface-300">{formatRelativeTime(note.captured_at)}</span>
        {isCapture && onClassify && 'ai_suggested_bucket' in note && note.ai_suggested_bucket && (
          <button
            onClick={(e) => { e.stopPropagation(); onClassify(note.id, note.ai_suggested_bucket!) }}
            className="w-7 h-7 rounded-full bg-surface-150 flex items-center justify-center transition-colors duration-[120ms] hover:bg-ember-500 group"
          >
            <Check size={14} className="text-surface-400 group-hover:text-white transition-colors" />
          </button>
        )}
      </div>
    </div>
  )
}
