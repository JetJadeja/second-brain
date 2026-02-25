type ReviewHeaderProps = {
  lastReviewed: string | null
  isAllComplete: boolean
}

function getSubtitle(lastReviewed: string | null, isAllComplete: boolean): { text: string; className: string } {
  if (isAllComplete) {
    return { text: 'Review complete', className: 'text-[var(--success)]' }
  }
  if (!lastReviewed) {
    return { text: "You haven't done a review yet. Let's get started.", className: 'text-[var(--surface-400)]' }
  }
  const days = Math.floor((Date.now() - new Date(lastReviewed).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return { text: 'Last reviewed: today', className: 'text-[var(--success)]' }
  }
  if (days > 14) {
    return { text: `Last reviewed: ${days} days ago — you're overdue`, className: 'text-[var(--warning)] animate-pulse' }
  }
  if (days > 7) {
    return { text: `Last reviewed: ${days} days ago`, className: 'text-[var(--warning)]' }
  }
  return { text: `Last reviewed: ${days} day${days === 1 ? '' : 's'} ago`, className: 'text-[var(--surface-400)]' }
}

export function ReviewHeader({ lastReviewed, isAllComplete }: ReviewHeaderProps) {
  const subtitle = getSubtitle(lastReviewed, isAllComplete)

  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold text-[var(--surface-700)]">Weekly Review</h1>
      <p className={`text-sm ${subtitle.className}`}>{subtitle.text}</p>
    </div>
  )
}
