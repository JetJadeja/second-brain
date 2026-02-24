import type { DashboardNote } from '../../lib/types'
import { formatRelativeTime, formatFullDate } from '../../lib/format-time'
import { Card } from '../ui/Card'
import { SourceIcon } from '../ui/SourceIcon'
import { DistillationDot } from '../ui/DistillationDot'
import { Chip } from '../ui/Chip'

interface NoteCardProps {
  note: DashboardNote
}

function getExcerpt(note: DashboardNote): string {
  return note.distillation || note.ai_summary || ''
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <SourceIcon source={note.source_type} />
        <span className="text-sm font-medium text-text-primary truncate">{note.title}</span>
      </div>
      <p className="text-xs text-text-tertiary mb-3 line-clamp-2">{getExcerpt(note)}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <DistillationDot status={note.distillation_status} />
        {note.bucket_path && <Chip label={note.bucket_path} />}
        <span className="text-xs text-text-tertiary" title={formatFullDate(note.captured_at)}>
          {formatRelativeTime(note.captured_at)}
        </span>
        {note.connection_count > 0 && (
          <span className="text-xs text-text-tertiary">{note.connection_count} links</span>
        )}
      </div>
    </Card>
  )
}
