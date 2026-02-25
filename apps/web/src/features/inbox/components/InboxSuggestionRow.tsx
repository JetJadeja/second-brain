import { Sparkles } from 'lucide-react'
import type { InboxSuggestionItem } from '../types/inbox.types'

type InboxSuggestionRowProps = {
  item: InboxSuggestionItem
  onAccept: () => void
  onDismiss: () => void
}

export function InboxSuggestionRow({ item, onAccept, onDismiss }: InboxSuggestionRowProps) {
  const description = item.description
    ?? (typeof item.payload?.['description'] === 'string' ? item.payload['description'] : item.type)

  return (
    <div className="flex h-14 items-center px-2">
      {/* Sparkle icon instead of checkbox + source */}
      <div className="flex w-[72px] shrink-0 items-center justify-center">
        <Sparkles size={16} className="text-ember-500" />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ember-500">
          Suggestion
        </span>
        <span className="truncate text-body-sm text-surface-500">{description}</span>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-sm bg-ember-500 px-3 py-1 text-body-sm text-white transition-colors hover:bg-ember-600"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-sm px-3 py-1 text-body-sm text-surface-300 transition-colors hover:text-surface-500"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
