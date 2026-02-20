import { useNavigate } from 'react-router-dom'
import type { BucketNote } from '../../lib/types'
import { Card } from '../ui/Card'
import { SourceIcon } from '../ui/SourceIcon'
import { DistillationDot } from '../ui/DistillationDot'
import { Chip } from '../ui/Chip'

interface BucketNoteCardProps {
  note: BucketNote
}

function getExcerpt(note: BucketNote): string {
  return note.distillation || note.ai_summary || ''
}

export function BucketNoteCard({ note }: BucketNoteCardProps) {
  const navigate = useNavigate()

  return (
    <Card interactive className="p-4" onClick={() => navigate(`/notes/${note.id}`)}>
      <div className="flex items-center gap-2 mb-2">
        <SourceIcon source={note.source_type} />
        <span className="text-sm font-medium text-text-primary truncate">{note.title}</span>
      </div>
      <p className="text-xs text-text-tertiary mb-3 line-clamp-2">{getExcerpt(note)}</p>
      <div className="flex items-center gap-3 flex-wrap">
        <DistillationDot status={note.distillation_status} />
        <span className="text-xs text-text-tertiary">{note.captured_at}</span>
        {note.connection_count > 0 && (
          <span className="text-xs text-text-tertiary">{note.connection_count} links</span>
        )}
        {note.tags.slice(0, 3).map((tag) => (
          <Chip key={tag} label={`#${tag}`} />
        ))}
      </div>
    </Card>
  )
}
