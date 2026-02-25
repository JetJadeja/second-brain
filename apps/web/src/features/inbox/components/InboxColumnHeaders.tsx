import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type InboxColumnHeadersProps = {
  allSelected: boolean
  someSelected: boolean
  onToggleAll: () => void
}

export function InboxColumnHeaders({ allSelected, someSelected, onToggleAll }: InboxColumnHeadersProps) {
  const isIndeterminate = someSelected && !allSelected

  return (
    <div className="sticky top-0 z-10 flex h-8 items-center border-b border-surface-200 bg-surface-100">
      {/* Select all */}
      <button
        type="button"
        onClick={onToggleAll}
        className="flex w-10 shrink-0 items-center justify-center"
        aria-label={allSelected ? 'Deselect all' : 'Select all'}
      >
        <span
          className={cn(
            'flex size-4 items-center justify-center rounded-sm border-[1.5px] transition-transform duration-100',
            allSelected || isIndeterminate ? 'border-ember-500 bg-ember-500' : 'border-surface-200 bg-transparent',
          )}
        >
          {allSelected && <Check size={12} className="text-white" />}
          {isIndeterminate && <Minus size={12} className="text-white" />}
        </span>
      </button>

      {/* Source spacer */}
      <div className="w-8 shrink-0" />

      {/* Content label */}
      <div className="flex-1 text-caption font-semibold uppercase tracking-[0.05em] text-surface-400">
        Content
      </div>

      {/* Suggested label */}
      <div className="w-40 shrink-0 px-2 text-caption font-semibold uppercase tracking-[0.05em] text-surface-400">
        Suggested
      </div>

      {/* Date label */}
      <div className="w-20 shrink-0 text-right text-caption font-semibold uppercase tracking-[0.05em] text-surface-400">
        Date
      </div>

      {/* Actions spacer */}
      <div className="w-20 shrink-0" />
    </div>
  )
}
