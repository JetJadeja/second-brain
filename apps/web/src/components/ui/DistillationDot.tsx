import type { DistillationStatus } from '../../lib/types'

const statusConfig: Record<DistillationStatus, { color: string; label: string }> = {
  raw: { color: 'bg-red-400', label: 'Raw' },
  key_points: { color: 'bg-yellow-400', label: 'Key Points' },
  distilled: { color: 'bg-green-400', label: 'Distilled' },
  evergreen: { color: 'bg-blue-400', label: 'Evergreen' },
}

interface DistillationDotProps {
  status: DistillationStatus
  showLabel?: boolean
  className?: string
}

export function DistillationDot({ status, showLabel = true, className = '' }: DistillationDotProps) {
  const { color, label } = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {showLabel && <span className="text-xs text-text-tertiary">{label}</span>}
    </span>
  )
}
