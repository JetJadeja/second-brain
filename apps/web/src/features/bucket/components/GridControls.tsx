import { Search, Network } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortOption } from '../types/bucket.types'

type GridControlsProps = {
  bucketName: string
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  graphView: boolean
  onToggleGraph: () => void
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'captured_at', label: 'Recent' },
  { value: 'connection_count', label: 'Most connected' },
  { value: 'needs_attention', label: 'Needs attention' },
]

export function GridControls({
  bucketName, sort, onSortChange, graphView, onToggleGraph,
}: GridControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Scoped search bar */}
      <div className="flex h-9 w-full max-w-[320px] items-center gap-2 rounded-md border border-surface-200 bg-surface-100 px-2">
        <Search size={14} className="shrink-0 text-surface-300" />
        <input
          type="text"
          placeholder={`Search within ${bucketName}…`}
          disabled
          title="Coming soon"
          className="w-full bg-transparent text-body-sm text-surface-700 placeholder:text-surface-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Sort segmented control */}
        <div className="flex h-8 items-center rounded-md bg-surface-150 p-0.5">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className={cn(
                'rounded-md px-3 py-1 text-body-sm transition-all duration-150',
                sort === option.value
                  ? 'bg-surface-200 font-medium text-surface-700'
                  : 'text-surface-300 hover:text-surface-400',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Mini-graph toggle */}
        <button
          type="button"
          onClick={onToggleGraph}
          className={cn(
            'flex size-8 items-center justify-center rounded-md transition-colors',
            graphView ? 'text-ember-500' : 'text-surface-300 hover:text-surface-400',
          )}
          aria-label="Toggle graph view"
        >
          <Network size={18} />
        </button>
      </div>
    </div>
  )
}
