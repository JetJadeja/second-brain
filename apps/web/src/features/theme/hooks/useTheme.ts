import { useContext } from 'react'
import { ThemeContext } from '../components/ThemeProvider'
import type { ThemeContextValue } from '../types/theme.types'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
