import { useNavigate } from 'react-router-dom'
import { ParaDot } from '@/components/shared/ParaDot'
import { PARA_LABELS } from '@/types/enums'
import { bucketRoute } from '@/constants/routes'
import type { DashboardArea } from '../types/dashboard.types'

type SpaceCardProps = {
  area: DashboardArea
}

export function SpaceCard({ area }: SpaceCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(bucketRoute(area.id))}
      className="relative w-full min-h-[120px] p-4 bg-surface-100 border border-surface-200 rounded-lg text-left transition-all duration-150 hover:border-surface-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] group overflow-hidden"
    >
      {/* Ember glow on hover */}
      <div className="absolute top-0 left-0 w-[60px] h-[60px] rounded-full bg-ember-700 opacity-0 group-hover:opacity-5 transition-opacity duration-150 -translate-x-3 -translate-y-3" />

      <div className="flex items-center justify-between relative">
        <span className="font-title-sm text-surface-700">{area.name}</span>
        <div className="flex items-center gap-1">
          <ParaDot type={area.type} />
          <span className="font-overline text-surface-300 uppercase tracking-[0.06em]">
            {PARA_LABELS[area.type]}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1 relative">
        {area.child_buckets.slice(0, 3).map((child) => (
          <p key={child.id} className="font-body-sm text-surface-400 truncate">
            {child.name}
            <span className="text-surface-300 ml-1.5">({child.note_count})</span>
          </p>
        ))}
        {area.child_buckets.length === 0 && (
          <p className="font-body-sm text-surface-300 italic">No sub-buckets</p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 relative">
        <span className="font-mono text-xs text-surface-300">{area.note_count} notes</span>
        <span className="font-mono text-xs text-surface-300 capitalize">{area.health}</span>
      </div>
    </button>
  )
}
