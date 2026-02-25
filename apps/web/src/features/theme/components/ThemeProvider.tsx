import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ResolvedTheme, Theme, ThemeContextValue } from '../types/theme.types'

export const ThemeContext = createContext<ThemeContextValue | null>(null)

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

function getStoredTheme(key: string, fallback: Theme): Theme {
  try {
    const stored = localStorage.getItem(key)
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored
    }
  } catch {
    // localStorage unavailable (SSR, incognito restrictions)
  }
  return fallback
}

function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme === 'system') {
    return systemDark ? 'dark' : 'light'
  }
  return theme
}

function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.setAttribute('data-theme', resolved)
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme(storageKey, defaultTheme))
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resolved = resolveTheme(theme, systemDark)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback(
    (next: Theme) => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
      document.documentElement.classList.add('theme-transitioning')

      transitionTimeout.current = setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
      }, 300)

      try {
        localStorage.setItem(storageKey, next)
      } catch {
        // localStorage unavailable
      }

      setThemeState(next)
    },
    [storageKey],
  )

  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme: resolved, setTheme }),
    [theme, resolved, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
