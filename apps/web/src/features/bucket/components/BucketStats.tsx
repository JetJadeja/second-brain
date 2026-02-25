import { FileText, Check, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ParaDot } from '@/components/shared/ParaDot'
import { PARA_LABELS } from '@/types/enums'
import type { ParaType } from '@/types/enums'
import type { ChildBucket } from '../types/bucket.types'

type BucketStatsProps = {
  type: ParaType
  stats: { noteCount: number; distilledCount: number; evergreenCount: number }
  childBuckets: ChildBucket[]
}

export function BucketStats({ type, stats, childBuckets }: BucketStatsProps) {
  const navigate = useNavigate()

  return (
    <div className="mt-1 space-y-2">
      {/* Type label */}
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300">
        {PARA_LABELS[type]}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-2 text-body-sm text-surface-400">
        <span className="flex items-center gap-1">
          <FileText size={14} className="text-surface-300" />
          {stats.noteCount} notes
        </span>
        <span className="text-surface-300">·</span>
        <span className="flex items-center gap-1">
          <Check size={14} className="text-surface-300" />
          {stats.distilledCount} distilled
        </span>
        <span className="text-surface-300">·</span>
        <span className="flex items-center gap-1">
          <Star size={14} className="text-surface-300" />
          {stats.evergreenCount} evergreen
        </span>
      </div>

      {/* Child bucket chips */}
      {childBuckets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {childBuckets.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => navigate(`/buckets/${child.id}`)}
              className="flex shrink-0 items-center gap-1.5 rounded-sm bg-surface-150 px-2 py-1 text-caption text-surface-400 transition-colors hover:bg-surface-200 hover:text-surface-500"
            >
              <ParaDot type={child.type} size={6} />
              <span className="font-medium">{child.name}</span>
              <span className="text-surface-300">{child.note_count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
