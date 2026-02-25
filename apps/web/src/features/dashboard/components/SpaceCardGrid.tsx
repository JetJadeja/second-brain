import { useState } from 'react'
import { SpaceCard } from './SpaceCard'
import type { DashboardArea } from '../types/dashboard.types'

type SpaceCardGridProps = {
  areas: DashboardArea[]
}

export function SpaceCardGrid({ areas }: SpaceCardGridProps) {
  const [showAll, setShowAll] = useState(false)

  const primaryAreas = areas.filter((a) => a.type === 'project' || a.type === 'area')
  const secondaryAreas = areas.filter((a) => a.type === 'resource' || a.type === 'archive')
  const visibleAreas = showAll ? areas : primaryAreas

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleAreas.map((area) => (
          <SpaceCard key={area.id} area={area} />
        ))}
      </div>

      {secondaryAreas.length > 0 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 font-body-sm text-surface-300 hover:text-surface-400 transition-colors"
        >
          {showAll ? 'Show less' : 'Show all'}
        </button>
      )}
    </div>
  )
}
