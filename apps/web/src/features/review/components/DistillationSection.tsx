import { useNavigate } from 'react-router-dom'
import type { DistillationNudge } from '../types/review.types'

type DistillationSectionProps = {
  nudges: DistillationNudge[]
}

function getViewCountColor(viewCount: number): string {
  if (viewCount >= 10) return 'text-ember-500'
  if (viewCount >= 5) return 'text-surface-500'
  return 'text-surface-400'
}

export function DistillationSection({ nudges }: DistillationSectionProps) {
  const navigate = useNavigate()

  if (nudges.length === 0) {
    return <p className="text-sm text-surface-400">Nothing needs distilling right now</p>
  }

  return (
    <div className="space-y-2">
      {nudges.map((nudge) => (
        <div key={nudge.id} className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-surface-600 truncate">{nudge.title}</p>
            <p className={`text-[10px] ${getViewCountColor(nudge.view_count)}`}>
              Opened {nudge.view_count} times
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/notes/${nudge.id}`)}
            className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-ember-500 hover:bg-ember-500/10 transition-colors"
          >
            Annotate
          </button>
        </div>
      ))}
    </div>
  )
}
