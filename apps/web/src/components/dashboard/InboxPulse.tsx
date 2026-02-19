import { inboxItems } from '../../lib/mock-data'
import { InboxCard } from './InboxCard'

export function InboxPulse() {
  const items = inboxItems.slice(0, 5)

  if (items.length === 0) return null

  const handleConfirm = (id: string) => {
    console.log('Confirm inbox item:', id)
  }

  const handleChange = (id: string) => {
    console.log('Change inbox item:', id)
  }

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Inbox Pulse <span className="text-sm font-normal text-text-tertiary">({items.length})</span>
        </h2>
        <button type="button" className="text-sm text-text-tertiary hover:underline">View all</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <InboxCard key={item.id} item={item} onConfirm={handleConfirm} onChange={handleChange} />
        ))}
      </div>
    </section>
  )
}
