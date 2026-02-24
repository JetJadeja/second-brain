import { useState, useEffect, useCallback } from 'react'
import type { InboxItem } from '../../lib/types'
import { Card } from '../ui/Card'
import { SourceIcon } from '../ui/SourceIcon'
import { InboxActions } from './InboxActions'

interface InboxQueueProps {
  items: InboxItem[]
  onActionComplete: () => void
}

export function InboxQueue({ items, onActionComplete }: InboxQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(items.length - 1)
    }
  }, [items.length, currentIndex])

  const handleComplete = useCallback(() => {
    onActionComplete()
  }, [onActionComplete])

  if (items.length === 0) return null

  const item = items[currentIndex]
  if (!item) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-tertiary">
          {currentIndex + 1} of {items.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm text-text-tertiary hover:text-text-primary disabled:opacity-30"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="text-sm text-text-tertiary hover:text-text-primary disabled:opacity-30"
            disabled={currentIndex >= items.length - 1}
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <SourceIcon source={item.source_type} className="text-lg" />
          <h2 className="text-lg font-semibold text-text-primary">{item.title}</h2>
        </div>

        {item.ai_summary && (
          <p className="text-sm text-text-secondary mb-4">{item.ai_summary}</p>
        )}

        {item.original_content && (
          <details className="mb-4">
            <summary className="text-sm text-text-tertiary cursor-pointer hover:text-text-secondary">
              Show original content
            </summary>
            <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
              {item.original_content}
            </p>
          </details>
        )}

        {item.related_notes.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-medium text-text-tertiary uppercase mb-2">Related Notes</h3>
            <div className="flex flex-col gap-1">
              {item.related_notes.map((note) => (
                <span key={note.id} className="text-sm text-text-secondary">
                  {note.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <InboxActions
        noteId={item.id}
        suggestedBucketId={item.ai_suggested_bucket}
        suggestedBucketPath={item.ai_suggested_bucket_path}
        onActionComplete={handleComplete}
      />
    </div>
  )
}
