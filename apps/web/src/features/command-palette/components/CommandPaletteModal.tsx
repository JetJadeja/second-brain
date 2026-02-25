import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useCommandPaletteStore } from '@/stores/command-palette.store'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useCommandPaletteSearch } from '../hooks/useCommandPaletteSearch'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { PaletteInput } from './PaletteInput'
import { PreSearchContent } from './PreSearchContent'

export function CommandPaletteModal() {
  const { isOpen, scopedBucketId, closePalette, openPalette } = useCommandPaletteStore()
  const search = useCommandPaletteSearch(scopedBucketId)
  const { recentSearches, addSearch, removeSearch } = useRecentSearches()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const togglePalette = useCallback(() => {
    if (isOpen) {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else {
      openPalette()
    }
  }, [isOpen, openPalette])

  useKeyboardShortcut('k', togglePalette, { meta: true, enableInInputs: true })

  useEffect(() => {
    if (!isOpen) search.reset()
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleBackdropClick(e: React.MouseEvent): void {
    if (e.target === e.currentTarget) closePalette()
  }

  function handleSelectQuery(q: string): void {
    addSearch(q)
    search.setQuery(q)
  }

  function handleNavigate(path: string): void {
    closePalette()
    navigate(path)
  }

  function handleClear(): void {
    search.setQuery('')
  }

  const isPreSearch = !search.query.trim() && !search.query.startsWith('/')
  const isCommand = search.query.startsWith('/')

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-surface-0/40 backdrop-blur-[8px] animate-[fade-in_100ms_ease-out]"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        className={cn(
          'relative mt-[20vh] h-fit w-[640px] max-w-[calc(100vw-32px)]',
          'bg-surface-100 border border-surface-200 rounded-2xl',
          'shadow-[0_16px_64px_rgba(13,5,11,0.5)]',
          'animate-[scale-in_150ms_ease-out]',
        )}
      >
        {/* Ember glow behind input */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 rounded-full bg-ember-700/8 blur-2xl pointer-events-none" />

        <PaletteInput
          query={search.query}
          onQueryChange={search.setQuery}
          mode={search.mode}
          onModeChange={search.setMode}
          onClear={handleClear}
        />

        {isPreSearch && (
          <PreSearchContent
            recentSearches={recentSearches}
            onSelectQuery={handleSelectQuery}
            onRemoveRecent={removeSearch}
            onNavigate={handleNavigate}
            buckets={[]}
            highlightedIndex={-1}
          />
        )}

        {!isPreSearch && !isCommand && search.mode === 'notes' && (
          <div className="p-4 text-center font-body-sm text-surface-400">
            {search.isSearching ? 'Searching…' : search.error ?? 'Type to search your notes'}
          </div>
        )}

        {!isPreSearch && !isCommand && search.mode === 'ask' && (
          <div className="p-4 text-center font-body-sm text-surface-400">
            {search.isSearching ? 'Thinking…' : 'Ask a question about your notes'}
          </div>
        )}

        {isCommand && (
          <div className="p-4 text-center font-body-sm text-surface-400">
            Command mode — type a command
          </div>
        )}
      </div>
    </div>
  )
}
