import { Keyboard } from 'lucide-react'
import { KeyboardBadge } from '@/components/shared/KeyboardBadge'
import { SHORTCUT_GROUPS } from '../types/settings.types'

export function ShortcutsCard() {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="size-4 text-surface-400" />
        <h2 className="text-[15px] font-semibold text-surface-700">Keyboard Shortcuts</h2>
      </div>

      <div className="space-y-5">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-surface-300">
              {group.label}
            </p>
            <div className="space-y-1.5">
              {group.shortcuts.map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-surface-500">{shortcut.description}</span>
                  <KeyboardBadge keys={shortcut.keys} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
