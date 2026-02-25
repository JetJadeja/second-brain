import { Link } from 'react-router-dom'
import { Moon, Settings, Sun, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/features/theme'
import { ROUTES } from '@/constants/routes'

export type SidebarFooterProps = {
  collapsed: boolean
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div
      className={cn(
        'shrink-0 h-12 border-t border-surface-200 px-3',
        collapsed ? 'flex flex-col items-center justify-center gap-2 py-2' : 'flex items-center gap-2',
      )}
    >
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          'p-1.5 rounded-sm transition-colors focus-ring',
          isDark
            ? 'text-surface-400 hover:text-surface-600'
            : 'text-surface-400 hover:text-surface-600',
        )}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <Link
        to={ROUTES.SETTINGS}
        className="p-1.5 text-surface-400 hover:text-surface-600 rounded-sm transition-colors focus-ring"
        aria-label="Settings"
      >
        <Settings size={16} />
      </Link>

      {!collapsed && <div className="flex-1" />}

      <div
        className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-200 text-surface-400 font-mono text-[10px] cursor-pointer"
        aria-label="User menu"
      >
        <User size={14} />
      </div>
    </div>
  )
}
