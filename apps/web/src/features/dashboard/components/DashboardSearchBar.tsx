import { Search } from 'lucide-react'
import { KeyboardBadge } from '@/components/shared/KeyboardBadge'
import { useCommandPaletteStore } from '@/stores/command-palette.store'

export function DashboardSearchBar() {
  const openPalette = useCommandPaletteStore((s) => s.openPalette)

  return (
    <div className="flex justify-center">
      <button
        onClick={() => openPalette()}
        className="w-full max-w-[640px] h-12 flex items-center px-4 bg-surface-100 border border-surface-200 rounded-xl cursor-pointer transition-colors duration-150 hover:border-ember-800"
      >
        <Search size={20} className="text-surface-400 shrink-0" />
        <span className="flex-1 text-left ml-3 font-body-lg text-surface-300">
          Ask your brain anything…
        </span>
        <KeyboardBadge keys="⌘K" />
      </button>
    </div>
  )
}
