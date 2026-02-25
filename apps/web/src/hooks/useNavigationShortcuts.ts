import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebarStore } from '@/stores/sidebar.store'
import { ROUTES } from '@/constants/routes'
import { useKeyboardShortcut } from './useKeyboardShortcut'
import { useChordShortcut } from './useChordShortcut'

export function useNavigationShortcuts(): void {
  const navigate = useNavigate()
  const toggleCollapse = useSidebarStore((s) => s.toggleCollapse)

  const goHome = useCallback(() => navigate(ROUTES.HOME), [navigate])
  const goInbox = useCallback(() => navigate(ROUTES.INBOX), [navigate])
  const goGraph = useCallback(() => navigate(ROUTES.GRAPH), [navigate])
  const goReview = useCallback(() => navigate(ROUTES.REVIEW), [navigate])
  const goSettings = useCallback(() => navigate(ROUTES.SETTINGS), [navigate])
  const goBack = useCallback(() => window.history.back(), [])
  const goForward = useCallback(() => window.history.forward(), [])

  // ⌘ + number navigation
  useKeyboardShortcut('1', goHome, { meta: true })
  useKeyboardShortcut('2', goInbox, { meta: true })
  useKeyboardShortcut('4', goGraph, { meta: true })
  useKeyboardShortcut('5', goReview, { meta: true })

  // ⌘ + utility shortcuts
  useKeyboardShortcut('\\', toggleCollapse, { meta: true })
  useKeyboardShortcut(',', goSettings, { meta: true })
  useKeyboardShortcut('[', goBack, { meta: true })
  useKeyboardShortcut(']', goForward, { meta: true })

  // Vim-style chord navigation (G then ...)
  useChordShortcut('g', 'h', goHome)
  useChordShortcut('g', 'i', goInbox)
  useChordShortcut('g', 'g', goGraph)
  useChordShortcut('g', 'r', goReview)
}
