import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ActivityFeedItem } from './ActivityFeedItem'
import type { DashboardInboxItem, DashboardContentItem, FeedItem } from '../types/dashboard.types'

type ActivityFeedProps = {
  inboxItems: DashboardInboxItem[]
  recentItems: DashboardContentItem[]
  onClassify: (noteId: string, bucketId: string) => void
}

export function ActivityFeed({ inboxItems, recentItems, onClassify }: ActivityFeedProps) {
  const feedItems = useMemo<FeedItem[]>(() => {
    const captures: FeedItem[] = inboxItems.map((item) => ({ type: 'capture', item }))
    const recents: FeedItem[] = recentItems.map((item) => ({ type: 'recent', item }))

    return [...captures, ...recents].sort((a, b) => {
      const dateA = a.type === 'suggestion' ? '' : a.item.captured_at
      const dateB = b.type === 'suggestion' ? '' : b.item.captured_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }, [inboxItems, recentItems])

  return (
    <div>
      <div className="divide-y divide-surface-200">
        {feedItems.map((feedItem) => {
          const key = feedItem.type === 'suggestion' ? feedItem.id : feedItem.item.id
          return (
            <ActivityFeedItem
              key={key}
              item={feedItem}
              onClassify={feedItem.type === 'capture' ? onClassify : undefined}
            />
          )
        })}
      </div>

      <Link
        to={ROUTES.INBOX}
        className="block mt-3 font-body-sm text-ember-500 hover:text-ember-600 transition-colors"
      >
        View all in Inbox
      </Link>
    </div>
  )
}
