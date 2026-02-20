import type { DistillationStatus } from '@second-brain/shared'
import { StatusDot } from './StatusDot'

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
  return <StatusDot color={color} label={showLabel ? label : undefined} className={className} />
}
