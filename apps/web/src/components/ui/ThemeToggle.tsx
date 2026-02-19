import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '../../stores/theme-store'

const options = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
]

export function ThemeToggle() {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setPreference(value)}
          title={label}
          className={`p-1.5 rounded transition-colors ${
            preference === value
              ? 'bg-active text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary hover:bg-hover'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
