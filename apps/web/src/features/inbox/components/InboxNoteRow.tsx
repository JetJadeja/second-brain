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
          'relative flex h-14 cursor-pointer items-center transition-colors duration-75',
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
          className="flex w-10 shrink-0 items-center justify-center"
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
        <div className="flex w-8 shrink-0 items-center justify-center">
          <SourceIcon sourceType={item.source_type} size={16} />
        </div>

        {/* Content */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 flex-col justify-center text-left"
        >
          <span className="truncate text-title-sm text-surface-700">{item.title}</span>
          {item.ai_summary && (
            <span className="truncate text-body-sm text-surface-400">{item.ai_summary}</span>
          )}
        </button>

        {/* Suggested bucket */}
        <div className="flex w-40 shrink-0 items-center px-2">
          <SuggestedBucketChip bucketName={item.ai_suggested_bucket_path} confidence={item.ai_confidence} />
        </div>

        {/* Date */}
        <div className="w-20 shrink-0 text-right font-mono text-[13px] text-surface-300">
          {formatRelativeTime(item.captured_at)}
        </div>

        {/* Actions */}
        <div className="flex w-24 shrink-0 items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSkip() }}
            className="flex size-7 items-center justify-center rounded-full border border-surface-200 transition-colors hover:bg-surface-200"
            aria-label="Skip"
            title="Skip"
          >
            <X size={14} className="text-surface-400" />
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className={cn(
              'flex size-7 items-center justify-center rounded-full border border-surface-200 transition-colors',
              hasSuggestion
                ? 'hover:border-ember-500 hover:bg-ember-500 hover:text-white'
                : 'hover:border-surface-400 hover:bg-surface-200',
            )}
            aria-label={hasSuggestion ? 'Accept suggestion' : 'Move to bucket'}
            title={hasSuggestion ? `File to ${item.ai_suggested_bucket_path}` : 'Choose a bucket'}
          >
            {hasSuggestion ? (
              <Check size={14} className="text-surface-300" />
            ) : (
              <FolderInput size={14} className="text-surface-400" />
            )}
          </button>
        </div>
      </div>

      {expanded && <InboxExpandedDetail item={item} />}
    </div>
  )
}
