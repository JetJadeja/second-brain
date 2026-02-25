import { formatRelativeTime } from '@/lib/format-relative-time'
import type { OrphanNote } from '../types/review.types'

type OrphanSectionProps = {
  orphans: OrphanNote[]
  actedIds: Set<string>
  onFindConnections: (orphan: OrphanNote) => void
  onArchive: (orphan: OrphanNote) => void
}

export function OrphanSection({ orphans, actedIds, onFindConnections, onArchive }: OrphanSectionProps) {
  const visible = orphans.filter((o) => !actedIds.has(o.id))

  if (visible.length === 0) {
    return <p className="text-sm text-[var(--surface-400)]">No unconnected notes</p>
  }

  return (
    <div className="space-y-2">
      {visible.map((orphan) => (
        <div key={orphan.id} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-opacity duration-200">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--surface-600)] truncate">{orphan.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {orphan.bucket_name && (
                <span className="rounded bg-[var(--surface-200)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--surface-500)]">
                  {orphan.bucket_name}
                </span>
              )}
              <span className="text-[10px] text-[var(--surface-400)]">{formatRelativeTime(orphan.captured_at)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFindConnections(orphan)}
            className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-[var(--ember-500)] hover:bg-[var(--ember-500)]/10 transition-colors"
          >
            Find connections
          </button>
          <button
            type="button"
            onClick={() => onArchive(orphan)}
            className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-[var(--surface-300)] hover:bg-[var(--surface-200)] transition-colors"
          >
            Archive
          </button>
        </div>
      ))}
    </div>
  )
}
