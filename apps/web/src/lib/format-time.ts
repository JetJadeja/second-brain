const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000
const WEEK = 604_800_000
const MONTH = 2_592_000_000
const YEAR = 31_536_000_000

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso

  const diff = Date.now() - date.getTime()
  if (diff < MINUTE) return 'just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo ago`
  return `${Math.floor(diff / YEAR)}y ago`
}

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function formatFullDate(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return iso
  return fullDateFormatter.format(date)
}
