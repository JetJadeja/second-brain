import { useLayoutEffect } from 'react'
import { useThemeStore, applyTheme } from '../stores/theme-store'

export function useForceLightMode() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark')
    return () => applyTheme(useThemeStore.getState().preference)
  }, [])
}
