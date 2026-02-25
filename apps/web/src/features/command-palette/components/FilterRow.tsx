import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOURCE_LABELS, DISTILLATION_LABELS } from '@/types/enums'
import type { NoteSource, DistillationStatus } from '@/types/enums'
import type { SearchFilters, TimeRange } from '../types/command-palette.types'

type FilterOption = { value: string; label: string }

const TYPE_OPTIONS: FilterOption[] = [
  { value: '', label: 'All types' },
  ...Object.entries(SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

const TIME_OPTIONS: FilterOption[] = [
  { value: 'any', label: 'Any time' },
  { value: 'day', label: 'Past day' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
]

const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Any status' },
  ...Object.entries(DISTILLATION_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

export type FilterRowProps = {
  filters: SearchFilters
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
}

export function FilterRow({ filters, onFilterChange }: FilterRowProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-200">
      <FilterChip
        label={filters.sourceType ? SOURCE_LABELS[filters.sourceType] : 'All types'}
        active={!!filters.sourceType}
        options={TYPE_OPTIONS}
        selected={filters.sourceType ?? ''}
        onSelect={(v) => onFilterChange('sourceType', (v || undefined) as NoteSource | undefined)}
      />
      <FilterChip
        label={filters.timeRange && filters.timeRange !== 'any' ? TIME_OPTIONS.find((o) => o.value === filters.timeRange)?.label ?? 'Any time' : 'Any time'}
        active={!!filters.timeRange && filters.timeRange !== 'any'}
        options={TIME_OPTIONS}
        selected={filters.timeRange ?? 'any'}
        onSelect={(v) => onFilterChange('timeRange', (v || 'any') as TimeRange)}
      />
      <FilterChip
        label={filters.distillationStatus ? DISTILLATION_LABELS[filters.distillationStatus] : 'Any status'}
        active={!!filters.distillationStatus}
        options={STATUS_OPTIONS}
        selected={filters.distillationStatus ?? ''}
        onSelect={(v) => onFilterChange('distillationStatus', (v || undefined) as DistillationStatus | undefined)}
      />
    </div>
  )
}

type FilterChipProps = {
  label: string
  active: boolean
  options: FilterOption[]
  selected: string
  onSelect: (value: string) => void
}

function FilterChip({ label, active, options, selected, onSelect }: FilterChipProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md font-body-sm transition-colors duration-100',
          active ? 'bg-ember-800 text-ember-500' : 'bg-surface-200 text-surface-400 hover:bg-surface-250',
        )}
      >
        {label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} role="presentation" />
          <div className="absolute top-full left-0 mt-1 z-20 min-w-[160px] max-h-[240px] overflow-y-auto bg-surface-100 border border-surface-200 rounded-lg shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onSelect(opt.value); setOpen(false) }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-1.5 font-body-sm text-left transition-colors',
                  selected === opt.value ? 'text-ember-500' : 'text-surface-500 hover:bg-surface-150',
                )}
              >
                {selected === opt.value && <Check size={12} className="shrink-0" />}
                <span className={selected !== opt.value ? 'pl-5' : ''}>{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
