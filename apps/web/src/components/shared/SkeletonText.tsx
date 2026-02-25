import { cn } from '@/lib/utils'

export type SkeletonTextProps = {
  width?: string | number
  height?: number
  rounded?: 'sm' | 'full'
  className?: string
}

export function SkeletonText({
  width = '100%',
  height = 14,
  rounded = 'sm',
  className,
}: SkeletonTextProps) {
  return (
    <div
      className={cn(
        'bg-surface-150 animate-skeleton-pulse',
        rounded === 'full' ? 'rounded-full' : 'rounded-sm',
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
