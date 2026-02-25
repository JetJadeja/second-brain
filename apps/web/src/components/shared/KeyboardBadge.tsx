import { cn } from '@/lib/utils'

export type KeyboardBadgeProps = {
  keys: string
  className?: string
}

export function KeyboardBadge({ keys, className }: KeyboardBadgeProps) {
  if (!keys) return null

  return (
    <kbd
      className={cn(
        'inline-flex items-center font-mono-sm bg-surface-200 text-surface-300 rounded-sm px-1 py-px',
        className,
      )}
    >
      {keys}
    </kbd>
  )
}
