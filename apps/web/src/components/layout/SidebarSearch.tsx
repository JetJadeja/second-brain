import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KeyboardBadge } from '@/components/shared/KeyboardBadge'
import { useCommandPaletteStore } from '@/stores/command-palette.store'

export type SidebarSearchProps = {
  collapsed: boolean
}

export function SidebarSearch({ collapsed }: SidebarSearchProps) {
  const openPalette = useCommandPaletteStore((s) => s.openPalette)

  function handleClick(): void {
    openPalette()
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="mx-auto flex items-center justify-center w-10 h-10 rounded-full bg-surface-150 text-surface-400 hover:bg-surface-200 hover:text-ember-500 transition-colors duration-150 focus-ring"
        aria-label="Search"
      >
        <Search size={18} />
      </button>
    )
  }

  return (
    <div className="px-3">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'group flex items-center gap-2 w-full h-9 px-3',
          'bg-surface-150 rounded-md',
          'text-surface-300 hover:bg-surface-200 transition-colors duration-150',
          'focus-ring',
        )}
      >
        <Search size={18} className="shrink-0 text-surface-400 group-hover:text-ember-500 transition-colors duration-150" />
        <span className="flex-1 text-left font-body text-surface-300">Search…</span>
        <KeyboardBadge keys="⌘K" />
      </button>
    </div>
  )
}
