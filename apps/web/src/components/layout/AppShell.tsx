import type { ReactNode } from 'react'
import { LeftRail } from './LeftRail'
import { MainContent } from './MainContent'
import { useRealtimeInbox } from '../../hooks/use-realtime-inbox'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useRealtimeInbox()

  return (
    <div className="flex h-screen bg-surface-alt font-mono">
      <LeftRail />
      <MainContent>{children}</MainContent>
    </div>
  )
}
