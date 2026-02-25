import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ActivityFeedItem } from './ActivityFeedItem'
import { FeedBatchBar } from './FeedBatchBar'
import type { DashboardInboxItem, DashboardContentItem, FeedItem } from '../types/dashboard.types'

type ActivityFeedProps = {
  inboxItems: DashboardInboxItem[]
  recentItems: DashboardContentItem[]
  onClassify: (noteId: string, bucketId: string) => void
  onSkip: (noteId: string) => void
  onMoveTo: (noteId: string) => void
  onBatchMove: (noteIds: string[]) => void
}

const MAX_FEED_ITEMS = 5

export function ActivityFeed({
  inboxItems, recentItems, onClassify, onSkip, onMoveTo, onBatchMove,
}: ActivityFeedProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const feedItems = useMemo<FeedItem[]>(() => {
    const byDate = (a: { captured_at: string }, b: { captured_at: string }) =>
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()

    const captures: FeedItem[] = [...inboxItems].sort(byDate).map((item) => ({ type: 'capture', item }))
    const remaining = MAX_FEED_ITEMS - captures.length
    const recents: FeedItem[] = [...recentItems].sort(byDate).slice(0, Math.max(0, remaining)).map((item) => ({ type: 'recent', item }))

    return [...captures, ...recents].slice(0, MAX_FEED_ITEMS)
  }, [inboxItems, recentItems])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBatchMove = useCallback(() => {
    onBatchMove(Array.from(selectedIds))
  }, [selectedIds, onBatchMove])

  return (
    <div>
      <div className="divide-y divide-surface-200">
        {feedItems.map((feedItem) => {
          const key = feedItem.type === 'suggestion' ? feedItem.id : feedItem.item.id
          const isCapture = feedItem.type === 'capture'
          return (
            <ActivityFeedItem
              key={key}
              item={feedItem}
              selected={isCapture ? selectedIds.has(feedItem.item.id) : undefined}
              onToggleSelect={isCapture ? () => toggleSelect(feedItem.item.id) : undefined}
              onClassify={isCapture ? onClassify : undefined}
              onSkip={isCapture ? onSkip : undefined}
              onMoveTo={isCapture ? onMoveTo : undefined}
            />
          )
        })}
      </div>

      <FeedBatchBar
        count={selectedIds.size}
        onMoveTo={handleBatchMove}
        onClear={() => setSelectedIds(new Set())}
      />

      <Link
        to={ROUTES.INBOX}
        className="block mt-3 font-body-sm text-ember-500 hover:text-ember-600 transition-colors"
      >
        View all in Inbox
      </Link>
    </div>
  )
}
