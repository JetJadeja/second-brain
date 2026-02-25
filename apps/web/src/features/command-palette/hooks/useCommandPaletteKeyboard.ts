import { useState, useCallback, useEffect } from 'react'
import type { PaletteMode, SearchMode } from '../types/command-palette.types'

export type KeyboardActions = {
  onActivate: (index: number) => void
  onClear: () => void
  onClose: () => void
  onModeChange: (mode: SearchMode) => void
}

export function useCommandPaletteKeyboard(
  itemCount: number,
  paletteMode: PaletteMode,
  query: string,
  currentMode: SearchMode,
  actions: KeyboardActions,
): {
  highlightedIndex: number
  setHighlightedIndex: (i: number) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
} {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [query, paletteMode])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setHighlightedIndex((prev) => (prev + 1) % Math.max(itemCount, 1))
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setHighlightedIndex((prev) => (prev <= 0 ? Math.max(itemCount - 1, 0) : prev - 1))
          break
        }
        case 'Enter': {
          e.preventDefault()
          if (highlightedIndex >= 0) {
            actions.onActivate(highlightedIndex)
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          if (query.trim()) {
            actions.onClear()
          } else {
            actions.onClose()
          }
          break
        }
        case 'Tab': {
          e.preventDefault()
          actions.onModeChange(currentMode === 'notes' ? 'ask' : 'notes')
          break
        }
      }
    },
    [itemCount, highlightedIndex, query, currentMode, actions],
  )

  return { highlightedIndex, setHighlightedIndex, handleKeyDown }
}
