import type { NoteDetailResponse } from '../../lib/types'
import { formatRelativeTime, formatFullDate } from '../../lib/format-time'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'
import { SourcePreview } from './SourcePreview'
import { NoteActions } from './NoteActions'

interface NoteContentProps {
  note: NoteDetailResponse['note']
}

function DistillationBar({ status }: { status: string }) {
  const stages = ['raw', 'key_points', 'distilled', 'evergreen'] as const
  const currentIndex = stages.indexOf(status as typeof stages[number])

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, i) => (
        <div
          key={stage}
          className={`h-1.5 flex-1 rounded-full ${i <= currentIndex ? 'bg-btn-primary' : 'bg-border'}`}
        />
      ))}
    </div>
  )
}

export function NoteContent({ note }: NoteContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-text-primary">{note.title}</h1>
        <div className="flex items-center gap-3 text-sm text-text-tertiary">
          <SourceIcon source={note.source_type} />
          <span title={formatFullDate(note.captured_at)}>
            Captured: {formatRelativeTime(note.captured_at)}
          </span>
          {note.view_count > 0 && (
            <span>{note.view_count} {note.view_count === 1 ? 'view' : 'views'}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {note.bucket_path && <Chip label={note.bucket_path} truncate />}
        <NoteActions noteId={note.id} currentBucketId={note.bucket_id} />
      </div>

      <DistillationBar status={note.distillation_status} />

      {note.ai_summary && (
        <div className="bg-hover/30 rounded-lg p-4">
          <h3 className="text-xs font-medium text-text-tertiary uppercase mb-2">AI Summary</h3>
          <p className="text-sm text-text-secondary">{note.ai_summary}</p>
        </div>
      )}

      {note.key_points.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-text-tertiary uppercase mb-2">Key Points</h3>
          <ul className="list-disc list-inside space-y-1">
            {note.key_points.map((point, i) => (
              <li key={i} className="text-sm text-text-secondary">{point}</li>
            ))}
          </ul>
        </div>
      )}

      {note.distillation && (
        <div>
          <h3 className="text-xs font-medium text-text-tertiary uppercase mb-2">Distillation</h3>
          <div className="text-sm text-text-primary whitespace-pre-wrap">{note.distillation}</div>
        </div>
      )}

      <SourcePreview
        sourceType={note.source_type}
        source={note.source}
        originalContent={note.original_content}
      />

      {note.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {note.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} />
          ))}
        </div>
      )}
    </div>
  )
}
