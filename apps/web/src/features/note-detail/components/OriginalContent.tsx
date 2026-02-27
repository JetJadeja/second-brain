import type { NoteDetail } from '../types/note-detail.types'

type OriginalContentProps = {
  note: NoteDetail
}

export function OriginalContent({ note }: OriginalContentProps) {
  if (!note.original_content) return null

  // Thoughts: plain pre-wrapped text
  if (note.is_original_thought) {
    return (
      <div className="whitespace-pre-wrap font-reading text-surface-600">
        {note.original_content}
      </div>
    )
  }

  // Article with source link
  const sourceUrl = typeof note.source['url'] === 'string' ? note.source['url'] : null
  const author = typeof note.source['author'] === 'string' ? note.source['author'] : null
  const thumbnail = typeof note.source['thumbnail_url'] === 'string' ? note.source['thumbnail_url'] : null

  return (
    <div className="space-y-4">
      {/* Source info */}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-body-sm text-ember-500 hover:underline"
        >
          ↗ {typeof note.source['domain'] === 'string' ? note.source['domain'] : 'Source'}
        </a>
      )}
      {author && <p className="text-body-sm text-surface-400">By {author}</p>}

      {/* Thumbnail */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className="max-h-[200px] w-full rounded-md object-cover"
        />
      )}

      {/* Content text */}
      <div className="whitespace-pre-wrap font-reading text-surface-600">
        {note.original_content}
      </div>
    </div>
  )
}
