import { useNavigate } from 'react-router-dom'
import type { NoteDetailResponse } from '../../lib/types'
import { Card } from '../ui/Card'
import { Chip } from '../ui/Chip'

interface NoteContextProps {
  relatedNotes: NoteDetailResponse['related_notes']
  backlinks: NoteDetailResponse['backlinks']
  source: Record<string, unknown>
  sourceType: string
}

function RelatedNotes({ notes }: { notes: NoteDetailResponse['related_notes'] }) {
  const navigate = useNavigate()

  if (notes.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-medium text-text-tertiary uppercase mb-3">Related Notes</h3>
      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <Card
            key={note.id}
            interactive
            className="p-3"
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            <span className="text-sm text-text-primary block truncate">{note.title}</span>
            {note.ai_summary && (
              <span className="text-xs text-text-tertiary block truncate mt-1">{note.ai_summary}</span>
            )}
            <div className="flex items-center gap-2 mt-1">
              {note.bucket_path && <Chip label={note.bucket_path} truncate />}
              <span className="text-xs text-text-tertiary">
                {note.connection_type === 'ai_detected' ? 'AI detected' : 'Explicit'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Backlinks({ notes }: { notes: NoteDetailResponse['backlinks'] }) {
  const navigate = useNavigate()

  if (notes.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-medium text-text-tertiary uppercase mb-3">Backlinks</h3>
      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <Card
            key={note.id}
            interactive
            className="p-3"
            onClick={() => navigate(`/notes/${note.id}`)}
          >
            <span className="text-sm text-text-primary block truncate">{note.title}</span>
            {note.bucket_path && <Chip label={note.bucket_path} truncate className="mt-1" />}
          </Card>
        ))}
      </div>
    </div>
  )
}

export function NoteContext({ relatedNotes, backlinks, source, sourceType }: NoteContextProps) {
  const url = source['url'] as string | undefined
  const author = source['author'] as string | undefined
  const domain = source['domain'] as string | undefined

  return (
    <div className="flex flex-col gap-6">
      <RelatedNotes notes={relatedNotes} />
      <Backlinks notes={backlinks} />

      <div>
        <h3 className="text-xs font-medium text-text-tertiary uppercase mb-3">Source</h3>
        <div className="flex flex-col gap-1 text-sm text-text-secondary">
          <span>Type: {sourceType}</span>
          {domain && <span>Domain: {domain}</span>}
          {author && <span>Author: {author}</span>}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
              {url}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
