import type { DashboardInboxItem } from '../../lib/types'
import { SectionHeader } from '../ui/SectionHeader'
import { InboxCard } from './InboxCard'
import { apiPost } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface InboxPulseProps {
  items: DashboardInboxItem[]
  totalCount: number
}

export function InboxPulse({ items, totalCount }: InboxPulseProps) {
  const queryClient = useQueryClient()

  if (items.length === 0) return null

  const handleConfirm = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item?.ai_suggested_bucket) return
    await apiPost(`/api/inbox/${id}/classify`, { bucket_id: item.ai_suggested_bucket })
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const handleChange = (id: string) => {
    console.log('Change inbox item:', id)
  }

  return (
    <section>
      <SectionHeader
        title="Inbox Pulse"
        count={totalCount}
        action={<a href="/inbox" className="text-sm text-text-tertiary hover:underline">View all</a>}
      />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <InboxCard key={item.id} item={item} onConfirm={handleConfirm} onChange={handleChange} />
        ))}
      </div>
    </section>
  )
}
