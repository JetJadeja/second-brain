import { cn } from '@/lib/utils'
import type { DistillationStatus } from '@/types/enums'

type DistillationBarProps = {
  status: DistillationStatus
}

const SEGMENTS: Array<{ key: DistillationStatus; label: string; filledClass: string }> = [
  { key: 'raw', label: 'Raw', filledClass: 'bg-status-raw' },
  { key: 'key_points', label: 'Key Points', filledClass: 'bg-amber-500' },
  { key: 'distilled', label: 'Distilled', filledClass: 'bg-green-500' },
  { key: 'evergreen', label: 'Evergreen', filledClass: 'bg-ember-500' },
]

const STATUS_ORDER: Record<DistillationStatus, number> = {
  raw: 0,
  key_points: 1,
  distilled: 2,
  evergreen: 3,
}

export function DistillationBar({ status }: DistillationBarProps) {
  const fillLevel = STATUS_ORDER[status]

  return (
    <div className="flex gap-0.5" role="progressbar" aria-valuenow={fillLevel + 1} aria-valuemax={4}>
      {SEGMENTS.map((segment, i) => (
        <div
          key={segment.key}
          className={cn(
            'h-1 flex-1 rounded-sm transition-colors',
            i <= fillLevel ? segment.filledClass : 'bg-surface-200',
          )}
          title={i <= fillLevel ? segment.label : `${segment.label} — Click to begin distillation`}
        />
      ))}
    </div>
  )
}
