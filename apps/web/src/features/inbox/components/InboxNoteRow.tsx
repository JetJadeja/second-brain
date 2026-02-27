import { Check, FolderInput, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SourceIcon } from '@/components/shared/SourceIcon'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { SuggestedBucketChip } from './SuggestedBucketChip'
import { InboxExpandedDetail } from './InboxExpandedDetail'
import type { InboxNoteItem } from '../types/inbox.types'

type InboxNoteRowProps = {
  item: InboxNoteItem
  selected: boolean
  focused: boolean
  expanded: boolean
  onToggleSelect: () => void
  onToggleExpand: () => void
  onClassify: () => void
  onMoveTo: () => void
  onSkip: () => void
}

export function InboxNoteRow({
  item, selected, focused, expanded, onToggleSelect, onToggleExpand, onClassify, onMoveTo, onSkip,
}: InboxNoteRowProps) {
  const hasSuggestion = item.ai_suggested_bucket !== null

  function handleAccept(e: React.MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation()
    if (hasSuggestion) onClassify()
    else onMoveTo()
  }

  return (
    <div>
      <div
        className={cn(
          'group relative flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors duration-75',
          selected && 'bg-ember-900/30',
          !selected && 'hover:bg-surface-100',
          focused && 'bg-surface-100',
        )}
      >
        {focused && (
          <div className="absolute inset-y-0 left-0 w-[3px] bg-ember-500" />
        )}

        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggleSelect}
          className="flex shrink-0 items-center justify-center pl-1"
          aria-label={selected ? 'Deselect note' : 'Select note'}
        >
          <span
            className={cn(
              'flex size-4 items-center justify-center rounded-sm border-[1.5px] transition-transform duration-100',
              selected ? 'border-ember-500 bg-ember-500' : 'border-surface-200 bg-transparent',
            )}
          >
            {selected && <Check size={12} className="text-white" />}
          </span>
        </button>

        {/* Source icon */}
        <div className="flex shrink-0 items-center justify-center">
          <SourceIcon sourceType={item.source_type} size={16} />
        </div>

        {/* Content — title, summary, and suggested bucket */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
        >
          <span className="truncate font-title-sm text-surface-700">
            {item.title}
          </span>
          {item.ai_summary && (
            <span className="line-clamp-1 text-body-sm text-surface-400">
              {item.ai_summary}
            </span>
          )}
          <div className="mt-1 flex items-center gap-2">
            <SuggestedBucketChip
              bucketName={item.ai_suggested_bucket_path}
              confidence={item.ai_confidence}
            />
            <span className="font-mono font-caption text-surface-300">
              {formatRelativeTime(item.captured_at)}
            </span>
          </div>
        </button>

        {/* Actions — visible on hover/focus */}
        <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSkip() }}
            className="flex size-8 items-center justify-center rounded-full border border-surface-200 transition-colors hover:bg-surface-200"
            aria-label="Skip"
            title="Skip"
          >
            <X size={14} className="text-surface-400" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveTo() }}
            className="flex size-8 items-center justify-center rounded-full border border-surface-200 transition-colors hover:border-surface-400 hover:bg-surface-200"
            aria-label="Move to bucket"
            title="Choose a bucket"
          >
            <FolderInput size={14} className="text-surface-400" />
          </button>
          {hasSuggestion && (
            <button
              type="button"
              onClick={handleAccept}
              className="flex size-8 items-center justify-center rounded-full border border-surface-200 transition-colors hover:border-ember-500 hover:bg-ember-500 hover:text-white"
              aria-label="Accept suggestion"
              title={`File to ${item.ai_suggested_bucket_path}`}
            >
              <Check size={14} className="text-surface-300" />
            </button>
          )}
        </div>
      </div>

      {expanded && <InboxExpandedDetail item={item} />}
    </div>
  )
}
