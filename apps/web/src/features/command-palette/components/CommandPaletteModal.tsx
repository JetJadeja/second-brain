import { useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { noteRoute } from '@/constants/routes'
import { useCommandPaletteStore } from '@/stores/command-palette.store'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useCommandPaletteSearch } from '../hooks/useCommandPaletteSearch'
import { useCommandPaletteKeyboard } from '../hooks/useCommandPaletteKeyboard'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { PaletteInput } from './PaletteInput'
import { PaletteContent } from './PaletteContent'
import type { PaletteMode } from '../types/command-palette.types'

function getPaletteMode(query: string, searchMode: 'notes' | 'ask'): PaletteMode {
  if (query.startsWith('/')) return 'command'
  if (!query.trim()) return 'pre-search'
  return searchMode
}

export function CommandPaletteModal() {
  const { isOpen, scopedBucketId, closePalette, openPalette } = useCommandPaletteStore()
  const search = useCommandPaletteSearch(scopedBucketId)
  const { recentSearches, addSearch, removeSearch } = useRecentSearches()
  const navigate = useNavigate()
  const paletteMode = getPaletteMode(search.query, search.mode)

  const itemCount = useMemo(() => {
    if (paletteMode === 'pre-search') return recentSearches.length + 6
    if (paletteMode === 'notes') return search.results.length
    if (paletteMode === 'command') return 5
    return 0
  }, [paletteMode, recentSearches.length, search.results.length])

  const keyboardActions = useMemo(() => ({
    onActivate: (index: number) => {
      if (paletteMode === 'notes' && search.results[index]) {
        addSearch(search.query)
        closePalette()
        navigate(noteRoute(search.results[index].id))
      }
    },
    onClear: () => search.setQuery(''),
    onClose: closePalette,
    onModeChange: search.setMode,
  }), [paletteMode, search, closePalette, navigate, addSearch])

  const keyboard = useCommandPaletteKeyboard(itemCount, paletteMode, search.query, search.mode, keyboardActions)

  const togglePalette = useCallback(() => {
    if (isOpen) closePalette(); else openPalette()
  }, [isOpen, openPalette, closePalette])

  useKeyboardShortcut('k', togglePalette, { meta: true, enableInInputs: true })
  useEffect(() => { if (!isOpen) search.reset() }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  function handleBackdropClick(e: React.MouseEvent): void {
    if (e.target === e.currentTarget) closePalette()
  }

  function handleSelectQuery(q: string): void { addSearch(q); search.setQuery(q) }
  function handleNavigate(path: string): void { closePalette(); navigate(path) }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-surface-0/40 backdrop-blur-[8px] animate-[fade-in_100ms_ease-out]"
      onClick={handleBackdropClick}
      onKeyDown={keyboard.handleKeyDown}
      role="presentation"
    >
      <div className={cn(
        'relative mt-[20vh] h-fit w-[640px] max-w-[calc(100vw-32px)]',
        'bg-surface-100 border border-surface-200 rounded-2xl',
        'shadow-[0_16px_64px_rgba(13,5,11,0.5)]',
        'animate-[scale-in_150ms_ease-out]',
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full bg-ember-700/8 blur-2xl pointer-events-none" />
        <PaletteInput
          query={search.query}
          onQueryChange={search.setQuery}
          mode={search.mode}
          onModeChange={search.setMode}
          onClear={() => search.setQuery('')}
        />
        <PaletteContent
          paletteMode={paletteMode}
          search={search}
          recentSearches={recentSearches}
          highlightedIndex={keyboard.highlightedIndex}
          onSelectQuery={handleSelectQuery}
          onRemoveRecent={removeSearch}
          onNavigate={handleNavigate}
          onClose={closePalette}
        />
      </div>
    </div>
  )
}
