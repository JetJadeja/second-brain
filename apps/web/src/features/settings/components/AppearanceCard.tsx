import { Moon, Sun, Monitor, Paintbrush } from 'lucide-react'
import { useTheme } from '@/features/theme/hooks/useTheme'
import type { Theme } from '@/features/theme/types/theme.types'

const THEME_OPTIONS: { value: Theme; icon: typeof Moon; label: string }[] = [
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="rounded-xl border border-[var(--surface-200)] bg-[var(--surface-100)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Paintbrush className="size-4 text-[var(--surface-400)]" />
        <h2 className="text-[15px] font-semibold text-[var(--surface-700)]">Appearance</h2>
      </div>

      <div className="relative flex rounded-lg bg-[var(--surface-150)] p-1">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[var(--surface-200)] text-[var(--surface-700)]'
                  : 'text-[var(--surface-400)] hover:text-[var(--surface-500)]'
              }`}
            >
              <Icon className="size-4" />
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
