import { Outlet } from 'react-router-dom'
import { useNavigationShortcuts } from '@/hooks/useNavigationShortcuts'
import { CommandPaletteModal } from '@/features/command-palette/components/CommandPaletteModal'
import { Sidebar } from './Sidebar'
import { ContentArea } from './ContentArea'

export function AppLayout() {
  useNavigationShortcuts()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <ContentArea>
        <Outlet />
      </ContentArea>
      <CommandPaletteModal />
    </div>
  )
}
