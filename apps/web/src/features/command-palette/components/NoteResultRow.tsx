import { cn } from '@/lib/utils'
import { SourceIcon } from '@/components/shared/SourceIcon'
import { StatusDot } from '@/components/shared/StatusDot'
import { formatRelativeTime } from '@/lib/format-relative-time'
import type { SearchResult } from '../types/command-palette.types'

export type NoteResultRowProps = {
  result: SearchResult
  query: string
  isHighlighted: boolean
  onClick: () => void
}

function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <span key={i} className="text-ember-500">{part}</span> : part,
  )
}

export function NoteResultRow({ result, query, isHighlighted, onClick }: NoteResultRowProps) {
  const distillationStatus = result.distillation_status

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full h-[72px] px-4 transition-colors duration-100 text-left',
        isHighlighted ? 'bg-surface-150 border-l-2 border-ember-500' : 'hover:bg-surface-150',
      )}
    >
      <div className="w-10 flex items-center justify-center shrink-0">
        <SourceIcon sourceType={result.source_type} size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('font-title-sm truncate', isHighlighted ? 'text-surface-800' : 'text-surface-700')}>
          {highlightMatches(result.title, query)}
        </p>
        {result.ai_summary && (
          <p className="font-body-sm text-surface-400 truncate">
            {highlightMatches(result.ai_summary, query)}
          </p>
        )}
      </div>

      <div className="w-[120px] shrink-0 flex justify-center">
        <span className="inline-block px-2 py-0.5 font-caption text-surface-300 bg-surface-200 rounded-sm truncate max-w-full">
          {result.bucket_path ?? 'Inbox'}
        </span>
      </div>

      <div className="w-[60px] shrink-0 flex flex-col items-end gap-1">
        <StatusDot status={distillationStatus} size={6} />
        <span className="font-mono-sm text-surface-300">{formatRelativeTime(result.captured_at)}</span>
      </div>
    </button>
  )
}

