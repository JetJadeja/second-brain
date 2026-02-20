import type { DashboardArea } from '../../lib/types'
import { Card } from '../ui/Card'
import { StatusDot } from '../ui/StatusDot'

const HEALTH_CONFIG: Record<DashboardArea['health'], { label: string; color: string }> = {
  growing: { label: 'Growing', color: 'bg-green-400' },
  stable: { label: 'Stable', color: 'bg-yellow-400' },
  stagnant: { label: 'Stagnant', color: 'bg-red-400' },
}

interface AreaCardProps {
  bucket: DashboardArea
}

export function AreaCard({ bucket }: AreaCardProps) {
  const health = HEALTH_CONFIG[bucket.health]

  return (
    <Card interactive className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">{bucket.name}</span>
        <StatusDot color={health.color} label={health.label} />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-tertiary">{bucket.note_count} notes</span>
        {bucket.last_capture_at && (
          <span className="text-xs text-text-tertiary">Last: {bucket.last_capture_at}</span>
        )}
      </div>
    </Card>
  )
}
