import { Home, Inbox, Network, CalendarCheck, Search, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ParaDot } from '@/components/shared/ParaDot'
import type { BucketTreeItem } from '@/components/layout/types'

export type PreSearchContentProps = {
  recentSearches: string[]
  onSelectQuery: (query: string) => void
  onRemoveRecent: (query: string) => void
  onNavigate: (path: string) => void
  buckets: BucketTreeItem[]
  highlightedIndex: number
}

const NAV_ITEMS: { id: string; label: string; icon: React.ReactNode; path: string }[] = [
  { id: 'home', label: 'Home', icon: <Home size={16} />, path: '/home' },
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} />, path: '/inbox' },
  { id: 'graph', label: 'Graph', icon: <Network size={16} />, path: '/graph' },
  { id: 'review', label: 'Review', icon: <CalendarCheck size={16} />, path: '/review' },
]

export function PreSearchContent({
  recentSearches, onSelectQuery, onRemoveRecent, onNavigate, buckets, highlightedIndex,
}: PreSearchContentProps) {
  let itemIndex = 0

  const bucketItems = buckets.slice(0, 3)

  return (
    <div className="max-h-[50vh] overflow-y-auto p-2">
      {recentSearches.length > 0 && (
        <Section title="Recent">
          {recentSearches.map((q) => {
            const idx = itemIndex++
            return (
              <Row key={q} highlighted={highlightedIndex === idx} onClick={() => onSelectQuery(q)}>
                <Search size={14} className="text-surface-300 shrink-0" />
                <span className="flex-1 truncate font-body-sm text-surface-500">{q}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveRecent(q) }}
                  className="text-surface-300 hover:text-surface-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove "${q}"`}
                >
                  <X size={14} />
                </button>
              </Row>
            )
          })}
        </Section>
      )}

      <Section title="Jump to">
        {NAV_ITEMS.map((item) => {
          const idx = itemIndex++
          return (
            <Row key={item.id} highlighted={highlightedIndex === idx} onClick={() => onNavigate(item.path)}>
              <span className="text-surface-400 shrink-0">{item.icon}</span>
              <span className="flex-1 font-body-sm text-surface-500">{item.label}</span>
            </Row>
          )
        })}
        {bucketItems.map((b) => {
          const idx = itemIndex++
          return (
            <Row key={b.id} highlighted={highlightedIndex === idx} onClick={() => onNavigate(`/buckets/${b.id}`)}>
              <ParaDot type={b.paraType} size={6} />
              <span className="flex-1 font-body-sm text-surface-500">{b.name}</span>
            </Row>
          )
        })}
      </Section>

      <Section title="Suggested">
        {['Recent captures', 'Unclassified notes'].map((suggestion) => {
          const idx = itemIndex++
          return (
            <Row key={suggestion} highlighted={highlightedIndex === idx} onClick={() => onSelectQuery(suggestion)}>
              <Sparkles size={14} className="text-ember-500 shrink-0" />
              <span className="flex-1 font-body-sm text-surface-500">{suggestion}</span>
            </Row>
          )
        })}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="font-overline text-surface-300 px-2 mb-1">{title}</p>
      {children}
    </div>
  )
}

function Row({ highlighted, onClick, children }: { highlighted: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors duration-100',
        highlighted ? 'bg-surface-150' : 'hover:bg-surface-150',
      )}
    >
      {children}
    </button>
  )
}
