import { type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type ContextPanelProps = {
  collapsed: boolean
  onToggle: () => void
  children: ReactNode
}

export function ContextPanel({ collapsed, onToggle, children }: ContextPanelProps) {
  return (
    <>
      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -left-3 top-4 z-10 flex size-6 items-center justify-center rounded-full bg-surface-150 text-surface-400 transition-transform hover:text-surface-500"
        aria-label={collapsed ? 'Expand context panel' : 'Collapse context panel'}
      >
        <ChevronRight size={14} className={cn('transition-transform duration-200', !collapsed && 'rotate-180')} />
      </button>

      {/* Panel content */}
      <div
        className={cn(
          'relative w-[300px] shrink-0 overflow-y-auto border-l border-surface-200 bg-surface-100 p-4 transition-all duration-200 max-lg:hidden',
          collapsed && 'w-0 overflow-hidden border-l-0 p-0',
        )}
      >
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </>
  )
}
