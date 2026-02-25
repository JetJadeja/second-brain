import type { AreaItem } from '../types/review.types'

type AreaBalanceSectionProps = {
  areas: AreaItem[]
}

function getBarOpacity(lastCapturedDays: number): number {
  if (lastCapturedDays <= 7) return 1
  if (lastCapturedDays <= 14) return 0.7
  if (lastCapturedDays <= 30) return 0.4
  return 0.2
}

export function AreaBalanceSection({ areas }: AreaBalanceSectionProps) {
  if (areas.length === 0) {
    return <p className="text-sm text-[var(--surface-400)]">No areas defined</p>
  }

  const maxCount = Math.max(...areas.map((a) => a.note_count), 1)
  const avgCount = areas.reduce((sum, a) => sum + a.note_count, 0) / areas.length

  return (
    <div className="space-y-3">
      {areas.map((area) => {
        const widthPercent = (area.note_count / maxCount) * 100
        const opacity = getBarOpacity(area.last_captured_days)
        const isOverloaded = area.note_count > avgCount * 3
        const isStagnant = area.last_captured_days >= 30

        return (
          <div key={area.name} className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="w-[120px] shrink-0 text-sm text-[var(--surface-600)] truncate">{area.name}</span>
              <div className="flex-1 h-4 rounded bg-[var(--surface-200)]">
                <div
                  className="h-full rounded bg-[var(--success)] transition-all duration-300"
                  style={{ width: `${widthPercent}%`, opacity }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-[var(--surface-400)]">{area.note_count}</span>
            </div>
            {isOverloaded && (
              <p className="ml-[132px] text-xs text-[var(--ember-500)]">Consider splitting</p>
            )}
            {isStagnant && (
              <p className="ml-[132px] text-xs text-[var(--warning)]">Stagnant — {area.last_captured_days}d since last note</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
