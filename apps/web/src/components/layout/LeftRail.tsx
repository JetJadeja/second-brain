import { useState } from 'react'
import { LayoutDashboard, Inbox, Search, GitFork, RefreshCw, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react'
import { NavItem } from '../nav/NavItem'
import { ParaSection } from '../nav/ParaSection'
import { Badge } from '../ui/Badge'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuthStore } from '../../stores/auth-store'

export function LeftRail() {
  const signOut = useAuthStore((s) => s.signOut)
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <aside className="w-12 h-screen flex-shrink-0 border-r border-border bg-surface flex flex-col items-center py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-hover"
          title="Expand sidebar"
        >
          <PanelLeft size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-60 h-screen flex-shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-sm font-semibold text-text-primary">Second Brain</span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-hover"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <NavItem label="Dashboard" href="/dashboard" icon={LayoutDashboard} />
        <NavItem label="Inbox" href="/inbox" icon={Inbox}>
          <Badge count={0} />
        </NavItem>

        <div className="my-2 border-t border-border" />

        <ParaSection label="Projects" defaultOpen />
        <ParaSection label="Areas" defaultOpen />
        <ParaSection label="Resources" />
        <ParaSection label="Archive" />

        <div className="my-2 border-t border-border" />

        <NavItem label="Search" href="/search" icon={Search} hint="⌘K" />
        <NavItem label="Graph" href="/graph" icon={GitFork} />
        <NavItem label="Review" href="/review" icon={RefreshCw} />
      </nav>

      <div className="border-t border-border p-2 flex items-center justify-between">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => { signOut() }}
          className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-hover transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
