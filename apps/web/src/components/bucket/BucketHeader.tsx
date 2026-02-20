import { useNavigate } from 'react-router-dom'
import type { BucketDetailResponse } from '../../lib/types'
import { Chip } from '../ui/Chip'

interface BucketHeaderProps {
  bucket: BucketDetailResponse['bucket']
}

const TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  area: 'Area',
  resource: 'Resource',
  archive: 'Archive',
}

export function BucketHeader({ bucket }: BucketHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-semibold text-text-primary">{bucket.name}</h1>
        <span className="text-sm text-text-tertiary">{TYPE_LABELS[bucket.type] ?? bucket.type}</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-text-tertiary">
        <span>{bucket.note_count} notes</span>
        <span>{bucket.distilled_count} distilled</span>
        <span>{bucket.evergreen_count} evergreen</span>
      </div>

      {bucket.children.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {bucket.children.map((child) => (
            <Chip
              key={child.id}
              label={`${child.name} (${child.note_count})`}
              onClick={() => navigate(`/para/${child.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
