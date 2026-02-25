import type { ConnectionSuggestion } from '../types/review.types'

type ConnectionSectionProps = {
  suggestions: ConnectionSuggestion[]
  dismissedIds: Set<string>
  onConnect: (suggestion: ConnectionSuggestion) => void
  onDismiss: (suggestion: ConnectionSuggestion) => void
}

export function ConnectionSection({ suggestions, dismissedIds, onConnect, onDismiss }: ConnectionSectionProps) {
  const visible = suggestions.filter((s) => !dismissedIds.has(s.id))

  if (visible.length === 0) {
    return <p className="text-sm text-[var(--surface-400)]">No suggestions right now</p>
  }

  return (
    <div className="space-y-3">
      {visible.map((suggestion) => (
        <div key={suggestion.id} className="rounded-lg border border-[var(--surface-200)] p-3 transition-opacity duration-200">
          <p className="text-sm text-[var(--surface-600)]">
            <span className="font-medium">{suggestion.note_a.title}</span>
            {' \u2194 '}
            <span className="font-medium">{suggestion.note_b.title}</span>
          </p>
          <p className="mt-1 text-sm text-[var(--surface-400)]">{suggestion.reason}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onConnect(suggestion)}
              className="rounded-md px-3 py-1 text-xs font-medium text-[var(--ember-500)] hover:bg-[var(--ember-500)]/10 transition-colors"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => onDismiss(suggestion)}
              className="rounded-md px-3 py-1 text-xs font-medium text-[var(--surface-300)] hover:bg-[var(--surface-200)] transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
