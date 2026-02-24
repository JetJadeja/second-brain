import { useState, useEffect, type ReactNode } from 'react'
import { LeftRail } from './LeftRail'
import { MainContent } from './MainContent'
import { ToastContainer } from '../ui/Toast'
import { ConnectTelegramModal } from '../onboarding/ConnectTelegramModal'
import { useRealtimeSync } from '../../hooks/use-realtime-sync'
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts'
import { useLinkStatus } from '../../hooks/use-link-status'
import { useAuthStore } from '../../stores/auth-store'

const DISMISS_KEY_PREFIX = 'sb-modal-dismissed-'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  useRealtimeSync()
  useKeyboardShortcuts()

  const userId = useAuthStore((s) => s.user?.id)
  const { isLinked, isLoading } = useLinkStatus()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (!userId) return
    const stored = localStorage.getItem(`${DISMISS_KEY_PREFIX}${userId}`)
    setDismissed(stored === 'true')
  }, [userId])

  const handleDismiss = () => {
    if (userId) {
      localStorage.setItem(`${DISMISS_KEY_PREFIX}${userId}`, 'true')
    }
    setDismissed(true)
  }

  const showModal = !isLoading && !isLinked && !dismissed

  return (
    <div className="flex h-screen bg-surface-alt font-mono">
      <LeftRail />
      <MainContent>{children}</MainContent>
      <ToastContainer />
      {showModal && <ConnectTelegramModal onDismiss={handleDismiss} />}
    </div>
  )
}
