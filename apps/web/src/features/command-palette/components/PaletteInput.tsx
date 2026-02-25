import { useEffect, useRef } from 'react'
import { Search, Brain, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchMode } from '../types/command-palette.types'

export type PaletteInputProps = {
  query: string
  onQueryChange: (q: string) => void
  mode: SearchMode
  onModeChange: (m: SearchMode) => void
  onClear: () => void
}

export function PaletteInput({ query, onQueryChange, mode, onModeChange, onClear }: PaletteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 h-12 border-b border-surface-200">
      <div className="relative w-5 h-5 shrink-0">
        <Search
          size={20}
          className={cn(
            'absolute inset-0 text-surface-400 transition-opacity duration-150',
            mode === 'ask' ? 'opacity-0' : 'opacity-100',
          )}
        />
        <Brain
          size={20}
          className={cn(
            'absolute inset-0 text-surface-400 transition-opacity duration-150',
            mode === 'ask' ? 'opacity-100 animate-pulse-subtle' : 'opacity-0',
          )}
        />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search your brain…"
        className="flex-1 bg-transparent font-title-sm text-surface-800 placeholder:text-surface-300 outline-none"
      />

      <div className="flex items-center gap-2 shrink-0">
        {query && (
          <button
            type="button"
            onClick={onClear}
            className="text-surface-300 hover:text-surface-400 transition-colors duration-100"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}

        <ModeTab label="Notes" active={mode === 'notes'} onClick={() => onModeChange('notes')} />
        <ModeTab label="Ask" active={mode === 'ask'} onClick={() => onModeChange('ask')} />
      </div>
    </div>
  )
}

type ModeTabProps = {
  label: string
  active: boolean
  onClick: () => void
}

function ModeTab({ label, active, onClick }: ModeTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-body-sm px-1 pb-px transition-colors duration-150',
        active
          ? 'text-ember-500 border-b-2 border-ember-500'
          : 'text-surface-400 hover:text-surface-500',
      )}
    >
      {label}
    </button>
  )
}
