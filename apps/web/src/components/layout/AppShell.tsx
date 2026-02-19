import type { ReactNode } from 'react'
import { LeftRail } from './LeftRail'
import { MainContent } from './MainContent'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-surface-alt font-mono">
      <LeftRail />
      <MainContent>{children}</MainContent>
    </div>
  )
}
