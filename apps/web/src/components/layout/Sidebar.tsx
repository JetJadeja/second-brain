import { CalendarCheck, Home, Inbox, Network } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useParaTree } from '@/hooks/useParaTree'
import { LAYOUT } from '@/constants/layout'
import { SidebarLogo } from './SidebarLogo'
import { SidebarSearch } from './SidebarSearch'
import { SidebarNavItem } from './SidebarNavItem'
import { SidebarParaSection } from './SidebarParaSection'
import { SidebarFooter } from './SidebarFooter'

export function Sidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const toggleCollapse = useSidebarStore((s) => s.toggleCollapse)
  const { buckets } = useParaTree()

  const width = isCollapsed ? LAYOUT.SIDEBAR_COLLAPSED_WIDTH : LAYOUT.SIDEBAR_EXPANDED_WIDTH

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-surface-50 border-r border-surface-200 shrink-0 overflow-hidden',
        'transition-[width] duration-200 ease-out',
      )}
      style={{ width }}
    >
      <SidebarLogo collapsed={isCollapsed} onToggleCollapse={toggleCollapse} />

      <div className="mt-1 mb-3">
        <SidebarSearch collapsed={isCollapsed} />
      </div>

      <nav className={cn('flex flex-col gap-0.5', isCollapsed ? 'px-1.5' : 'px-2')}>
        <SidebarNavItem icon={Home} label="Home" href="/home" shortcut="⌘1" collapsed={isCollapsed} />
        <SidebarNavItem icon={Inbox} label="Inbox" href="/inbox" shortcut="⌘2" collapsed={isCollapsed} />
      </nav>

      <div className="mx-4 my-3 h-px bg-surface-200" />

      <SidebarParaSection buckets={buckets} collapsed={isCollapsed} />

      <div className="mx-4 my-3 h-px bg-surface-200" />

      <nav className={cn('flex flex-col gap-0.5 mb-2', isCollapsed ? 'px-1.5' : 'px-2')}>
        <SidebarNavItem icon={Network} label="Graph" href="/graph" shortcut="⌘4" collapsed={isCollapsed} />
        <SidebarNavItem icon={CalendarCheck} label="Review" href="/review" shortcut="⌘5" collapsed={isCollapsed} />
      </nav>

      <SidebarFooter collapsed={isCollapsed} />
    </aside>
  )
}
