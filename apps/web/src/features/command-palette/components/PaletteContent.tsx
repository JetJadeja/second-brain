import { PreSearchContent } from './PreSearchContent'
import { FilterRow } from './FilterRow'
import { NoteResultsList } from './NoteResultsList'
import { AskContent } from './AskContent'
import { CommandList } from './CommandList'
import type { PaletteMode, CommandPaletteSearchState } from '../types/command-palette.types'

export type PaletteContentProps = {
  paletteMode: PaletteMode
  search: CommandPaletteSearchState
  recentSearches: string[]
  highlightedIndex: number
  onSelectQuery: (q: string) => void
  onRemoveRecent: (q: string) => void
  onNavigate: (path: string) => void
  onClose: () => void
}

export function PaletteContent({
  paletteMode, search, recentSearches, highlightedIndex,
  onSelectQuery, onRemoveRecent, onNavigate, onClose,
}: PaletteContentProps) {
  if (paletteMode === 'pre-search') {
    return (
      <PreSearchContent
        recentSearches={recentSearches}
        onSelectQuery={onSelectQuery}
        onRemoveRecent={onRemoveRecent}
        onNavigate={onNavigate}
        buckets={[]}
        highlightedIndex={highlightedIndex}
      />
    )
  }

  if (paletteMode === 'notes') {
    return (
      <>
        <FilterRow filters={search.filters} onFilterChange={search.setFilter} />
        <NoteResultsList
          results={search.results}
          totalFound={search.totalFound}
          query={search.query}
          isSearching={search.isSearching}
          highlightedIndex={highlightedIndex}
          onLoadMore={search.loadMore}
          onSwitchToAsk={() => search.setMode('ask')}
        />
      </>
    )
  }

  if (paletteMode === 'ask') {
    return (
      <AskContent
        query={search.query}
        filters={search.filters}
        askResponse={search.askResponse}
        isSearching={search.isSearching}
      />
    )
  }

  if (paletteMode === 'command') {
    return (
      <CommandList
        query={search.query}
        highlightedIndex={highlightedIndex}
        onExecute={onClose}
      />
    )
  }

  return null
}
