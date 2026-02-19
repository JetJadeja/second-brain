import type { Note, ParaType } from '../../lib/types'
import { Card } from '../ui/Card'
import { SourceIcon } from '../ui/SourceIcon'
import { DistillationDot } from '../ui/DistillationDot'
import { Chip } from '../ui/Chip'

const BUCKET_LABELS: Record<ParaType, string> = {
  project: 'Projects',
  area: 'Areas',
  resource: 'Resources',
  archive: 'Archive',
}

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <SourceIcon source={note.sourceType} />
        <span className="text-sm font-medium text-text-primary truncate">{note.title}</span>
      </div>
      <p className="text-xs text-text-tertiary mb-3 line-clamp-2">{note.excerpt}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <DistillationDot status={note.distillationStatus} />
        <Chip label={`${BUCKET_LABELS[note.bucketType]}/${note.bucketName}`} />
        <span className="text-xs text-text-tertiary">{note.capturedAt}</span>
        {note.connectionCount > 0 && (
          <span className="text-xs text-text-tertiary">{note.connectionCount} links</span>
        )}
      </div>
    </Card>
  )
}
