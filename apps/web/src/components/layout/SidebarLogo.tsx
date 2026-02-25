import { Brain, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SidebarLogoProps = {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function SidebarLogo({ collapsed, onToggleCollapse }: SidebarLogoProps) {
  const ToggleIcon = collapsed ? ChevronsRight : ChevronsLeft

  return (
    <div className={cn('relative flex items-center h-[52px] shrink-0', collapsed ? 'justify-center' : 'px-4')}>
      <div
        className={cn(
          'group flex items-center gap-2 cursor-default',
          'before:absolute before:inset-0 before:rounded-lg before:bg-ember-700/0 before:transition-[background-color] before:duration-150',
          'hover:before:bg-ember-700/[0.08]',
        )}
      >
        <Brain size={20} className="relative z-10 text-ember-500 shrink-0" />
        {!collapsed && (
          <span className="relative z-10 font-title-sm text-surface-700 whitespace-nowrap">
            Second Brain
          </span>
        )}
      </div>

      {!collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-surface-300 hover:text-surface-500 transition-colors rounded-sm focus-ring"
          aria-label="Collapse sidebar"
        >
          <ToggleIcon size={16} />
        </button>
      )}

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute right-0 top-1 p-0.5 text-surface-300 hover:text-surface-500 transition-colors rounded-sm focus-ring"
          aria-label="Expand sidebar"
        >
          <ToggleIcon size={14} />
        </button>
      )}
    </div>
  )
}
