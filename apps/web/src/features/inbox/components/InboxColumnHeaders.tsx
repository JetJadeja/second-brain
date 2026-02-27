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
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-surface-200 bg-surface-100 px-2 py-2">
      {/* Select all */}
      <button
        type="button"
        onClick={onToggleAll}
        className="flex shrink-0 items-center justify-center pl-1"
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

      <span className="text-caption font-semibold uppercase tracking-[0.05em] text-surface-400">
        Content
      </span>
    </div>
  )
}
