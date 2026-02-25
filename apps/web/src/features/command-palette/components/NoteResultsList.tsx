import { useNavigate } from 'react-router-dom'
import { SkeletonText } from '@/components/shared/SkeletonText'
import { useCommandPaletteStore } from '@/stores/command-palette.store'
import { noteRoute } from '@/constants/routes'
import { NoteResultRow } from './NoteResultRow'
import type { SearchResult } from '../types/command-palette.types'

export type NoteResultsListProps = {
  results: SearchResult[]
  totalFound: number
  query: string
  isSearching: boolean
  highlightedIndex: number
  onLoadMore: () => void
  onSwitchToAsk: () => void
}

export function NoteResultsList({
  results, totalFound, query, isSearching, highlightedIndex, onLoadMore, onSwitchToAsk,
}: NoteResultsListProps) {
  const navigate = useNavigate()
  const closePalette = useCommandPaletteStore((s) => s.closePalette)

  function handleSelect(noteId: string): void {
    closePalette()
    navigate(noteRoute(noteId))
  }

  if (isSearching && results.length === 0) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 h-[72px] animate-[fade-in_100ms_ease-out]"
            style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
          >
            <div className="w-10 flex justify-center">
              <SkeletonText className="w-4 h-4 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <SkeletonText className="w-3/4 h-4" />
              <SkeletonText className="w-1/2 h-3" />
            </div>
            <SkeletonText className="w-16 h-5 rounded" />
            <div className="w-[60px] flex flex-col items-end gap-1">
              <SkeletonText className="w-2 h-2 rounded-full" />
              <SkeletonText className="w-6 h-3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!isSearching && results.length === 0 && query.trim()) {
    return (
      <div className="p-8 text-center">
        <p className="font-body text-surface-400">No notes match &apos;{query}&apos;</p>
        <p className="mt-2 font-body-sm text-surface-300">
          Try a different search or{' '}
          <button type="button" onClick={onSwitchToAsk} className="text-ember-500 hover:underline">
            switch to Ask mode
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-[50vh] overflow-y-auto">
      {totalFound > 0 && (
        <p className="px-4 pt-2 font-caption text-surface-300">{totalFound} notes</p>
      )}

      {results.map((result, i) => (
        <NoteResultRow
          key={result.id}
          result={result}
          query={query}
          isHighlighted={highlightedIndex === i}
          onClick={() => handleSelect(result.id)}
        />
      ))}

      {totalFound > results.length && (
        <button
          type="button"
          onClick={onLoadMore}
          className="w-full py-3 text-center font-body-sm text-ember-500 hover:underline"
        >
          Show more results
        </button>
      )}
    </div>
  )
}
