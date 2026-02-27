import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type BatchToolbarProps = {
  selectedCount: number
  suggestedCount: number
  onConfirmSuggested: () => void
  onMoveTo: () => void
  onArchive: () => void
  onDelete: () => void
}

export function BatchToolbar({
  selectedCount, suggestedCount, onConfirmSuggested, onMoveTo, onArchive, onDelete,
}: BatchToolbarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const visible = selectedCount > 0

  // Auto-cancel delete confirm after 3s
  useEffect(() => {
    if (!deleteConfirm) return
    const timer = setTimeout(() => setDeleteConfirm(false), 3000)
    return () => clearTimeout(timer)
  }, [deleteConfirm])

  // Reset delete confirm when selection changes
  useEffect(() => setDeleteConfirm(false), [selectedCount])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-6 z-50 mx-auto flex h-14 max-w-[480px] items-center gap-3 rounded-lg bg-surface-100 px-4 shadow-overlay transition-all duration-200',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <span className="text-body text-surface-400">
        {selectedCount} selected
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirmSuggested}
          disabled={suggestedCount === 0}
          className="rounded-sm bg-ember-500 px-3 py-1.5 text-body-sm text-white transition-colors hover:bg-ember-600 disabled:opacity-40"
        >
          {suggestedCount > 0 ? `Confirm ${suggestedCount} suggested` : 'Confirm as suggested'}
        </button>
        <button
          type="button"
          onClick={onMoveTo}
          className="rounded-sm px-3 py-1.5 text-body-sm text-surface-400 transition-colors hover:text-surface-500"
        >
          Move to
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="rounded-sm px-3 py-1.5 text-body-sm text-surface-400 transition-colors hover:text-surface-500"
        >
          Archive
        </button>
        {deleteConfirm ? (
          <button
            type="button"
            onClick={() => { onDelete(); setDeleteConfirm(false) }}
            className="relative overflow-hidden rounded-sm px-3 py-1.5 text-body-sm text-danger transition-colors hover:text-danger"
          >
            Confirm delete?
            <span className="absolute inset-x-0 bottom-0 h-0.5 animate-[shrink_3s_linear] bg-danger" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="rounded-sm px-3 py-1.5 text-body-sm text-danger transition-colors hover:text-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
