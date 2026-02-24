import type { ReactNode } from 'react'
import { LeftRail } from './LeftRail'
import { MainContent } from './MainContent'
import { ToastContainer } from '../ui/Toast'
import { useRealtimeSync } from '../../hooks/use-realtime-sync'
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useRealtimeSync()
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen bg-surface-alt font-mono">
      <LeftRail />
      <MainContent>{children}</MainContent>
      <ToastContainer />
    </div>
  )
}
