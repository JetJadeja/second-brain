import { cn } from '@/lib/utils'

export type SkeletonImageProps = {
  width?: string | number
  height?: number
  className?: string
}

export function SkeletonImage({
  width = '100%',
  height = 120,
  className,
}: SkeletonImageProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-surface-150', className)}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 animate-skeleton-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}
