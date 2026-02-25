import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KeyboardBadge } from '@/components/shared/KeyboardBadge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type SidebarNavItemProps = {
  icon: LucideIcon
  label: string
  href: string
  shortcut?: string
  badge?: ReactNode
  collapsed: boolean
}

export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  shortcut,
  badge,
  collapsed,
}: SidebarNavItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === href

  const content = (
    <Link
      to={href}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-sm px-4 h-9 transition-colors duration-[120ms] ease-out',
        'focus-ring',
        isActive
          ? 'bg-surface-150 text-surface-700'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-600',
        collapsed && 'justify-center px-0',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-ember-500 rounded-r-full animate-[slide-in-left_200ms_var(--ease-out)]" />
      )}

      <Icon
        size={18}
        className={cn(
          'shrink-0 transition-colors duration-[120ms]',
          isActive ? 'text-ember-500' : 'text-surface-400 group-hover:text-surface-600',
        )}
      />

      {!collapsed && (
        <>
          <span className="flex-1 font-body truncate">{label}</span>
          {badge}
          {shortcut && <KeyboardBadge keys={shortcut} />}
        </>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="bg-surface-100 text-surface-600 font-body-sm rounded-sm">
          {label}{shortcut && ` (${shortcut})`}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
