import type { NoteDetailResponse } from '../../lib/types'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'

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
  const sourceUrl = note.source['url'] as string | undefined
  const sourceDomain = note.source['domain'] as string | undefined

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-text-primary">{note.title}</h1>
        <div className="flex items-center gap-3 text-sm text-text-tertiary">
          <SourceIcon source={note.source_type} />
          {sourceDomain && <span>{sourceDomain}</span>}
          <span>Captured: {note.captured_at}</span>
          <span>{note.view_count} views</span>
        </div>
      </div>

      {note.bucket_path && <Chip label={note.bucket_path} />}

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

      {note.original_content && (
        <details>
          <summary className="text-sm text-text-tertiary cursor-pointer hover:text-text-secondary">
            Original content
          </summary>
          <div className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">
            {note.original_content}
          </div>
        </details>
      )}

      {note.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {note.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} />
          ))}
        </div>
      )}

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          View original source
        </a>
      )}
    </div>
  )
}
