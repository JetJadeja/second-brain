import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { useInbox } from '../hooks/use-inbox'
import { InboxQueue } from '../components/inbox/InboxQueue'
import { InboxList } from '../components/inbox/InboxList'
import { EmptyState } from '../components/ui/EmptyState'

type InboxMode = 'queue' | 'list'

export default function InboxPage() {
  const [mode, setMode] = useState<InboxMode>('queue')
  const { data, isLoading, refetch } = useInbox()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-text-tertiary">Loading inbox...</span>
      </div>
    )
  }

  const items = data?.items ?? []

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        message="You're all caught up. Items you capture via Telegram will appear here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">
          Inbox <span className="text-text-tertiary font-normal">({data?.total ?? 0})</span>
        </h1>
        <div className="flex gap-1 bg-hover rounded p-0.5">
          <button
            type="button"
            className={`text-xs px-3 py-1 rounded ${mode === 'queue' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-tertiary'}`}
            onClick={() => setMode('queue')}
          >
            Queue
          </button>
          <button
            type="button"
            className={`text-xs px-3 py-1 rounded ${mode === 'list' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-tertiary'}`}
            onClick={() => setMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {mode === 'queue' ? (
        <InboxQueue items={items} onActionComplete={() => refetch()} />
      ) : (
        <InboxList items={items} onActionComplete={() => refetch()} />
      )}
    </div>
  )
}
