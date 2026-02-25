import { useEffect, useRef } from 'react'
import { NoteCard } from './NoteCard'
import type { BucketNote } from '../types/bucket.types'

type NoteGridProps = {
  notes: BucketNote[]
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function NoteGrid({ notes, isLoadingMore, onLoadMore }: NoteGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) onLoadMore() },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore])

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="size-5 animate-spin rounded-full border-2 border-surface-200 border-t-ember-500" />
        </div>
      )}
    </div>
  )
}
