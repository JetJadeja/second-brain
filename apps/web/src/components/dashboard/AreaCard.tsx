import type { ParaBucket } from '../../lib/types'
import { Card } from '../ui/Card'
import { StatusDot } from '../ui/StatusDot'

const MS_PER_DAY = 1000 * 60 * 60 * 24
const GROWING_THRESHOLD_DAYS = 14
const STABLE_THRESHOLD_DAYS = 28

function getHealthIndicator(lastCapture: string): { label: string; color: string } {
  const daysSince = Math.floor((Date.now() - new Date(lastCapture).getTime()) / MS_PER_DAY)
  if (daysSince <= GROWING_THRESHOLD_DAYS) return { label: 'Growing', color: 'bg-green-400' }
  if (daysSince <= STABLE_THRESHOLD_DAYS) return { label: 'Stable', color: 'bg-yellow-400' }
  return { label: 'Stagnant', color: 'bg-red-400' }
}

interface AreaCardProps {
  bucket: ParaBucket
}

export function AreaCard({ bucket }: AreaCardProps) {
  const health = getHealthIndicator(bucket.lastCaptureDate)

  return (
    <Card interactive className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">{bucket.name}</span>
        <StatusDot color={health.color} label={health.label} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-tertiary">{bucket.noteCount} notes</span>
        <span className="text-xs text-text-tertiary">Last: {bucket.lastCaptureDate}</span>
      </div>
    </Card>
  )
}
