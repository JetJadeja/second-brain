type InboxHeaderProps = {
  totalCount: number
}

export function InboxHeader({ totalCount }: InboxHeaderProps) {
  return (
    <div className="flex items-baseline gap-3">
      <h1 className="text-title-lg text-surface-700">Inbox</h1>
      <span className="text-body text-surface-400">
        {totalCount} {totalCount === 1 ? 'item' : 'items'}
      </span>
    </div>
  )
}
