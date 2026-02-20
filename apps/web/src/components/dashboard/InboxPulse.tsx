import type { DashboardInboxItem } from '../../lib/types'
import { SectionHeader } from '../ui/SectionHeader'
import { InboxCard } from './InboxCard'

interface InboxPulseProps {
  items: DashboardInboxItem[]
}

export function InboxPulse({ items }: InboxPulseProps) {
  const visible = items.slice(0, 5)

  if (visible.length === 0) return null

  const handleConfirm = (id: string) => {
    console.log('Confirm inbox item:', id)
  }

  const handleChange = (id: string) => {
    console.log('Change inbox item:', id)
  }

  return (
    <section>
      <SectionHeader
        title="Inbox Pulse"
        count={items.length}
        action={<button type="button" className="text-sm text-text-tertiary hover:underline">View all</button>}
      />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {visible.map((item) => (
          <InboxCard key={item.id} item={item} onConfirm={handleConfirm} onChange={handleChange} />
        ))}
      </div>
    </section>
  )
}
