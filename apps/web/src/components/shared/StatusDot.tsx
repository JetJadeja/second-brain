import { cn } from '@/lib/utils'
import { DISTILLATION_LABELS } from '@/types/enums'
import type { DistillationStatus } from '@/types/enums'

const STATUS_COLORS: Record<DistillationStatus, string> = {
  raw: 'bg-status-raw',
  key_points: 'bg-status-keypoints',
  distilled: 'bg-status-distilled',
  evergreen: 'bg-status-evergreen',
}

export type StatusDotProps = {
  status: DistillationStatus
  size?: number
  className?: string
}

export function StatusDot({ status, size = 6, className }: StatusDotProps) {
  return (
    <span
      className={cn('inline-block shrink-0 rounded-full', STATUS_COLORS[status], className)}
      style={{ width: size, height: size }}
      aria-label={`Status: ${DISTILLATION_LABELS[status]}`}
      role="img"
    />
  )
}
