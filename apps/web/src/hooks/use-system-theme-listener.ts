import { useEffect } from 'react'
import { useThemeStore, applyTheme } from '../stores/theme-store'

export function useSystemThemeListener() {
  const preference = useThemeStore((s) => s.preference)

  useEffect(() => {
    if (preference !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])
}
