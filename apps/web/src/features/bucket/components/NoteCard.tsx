import { useNavigate } from 'react-router-dom'
import { SourceIcon } from '@/components/shared/SourceIcon'
import { StatusDot } from '@/components/shared/StatusDot'
import { formatRelativeTime } from '@/lib/format-relative-time'
import type { BucketNote } from '../types/bucket.types'

function getExcerpt(note: BucketNote): string | null {
  if (note.ai_summary) return note.ai_summary
  return null
}

function getThumbnail(note: BucketNote): string | null {
  const source = note.source
  if (typeof source['thumbnail_url'] === 'string') return source['thumbnail_url']
  if (typeof source['cover_image'] === 'string') return source['cover_image']
  return null
}

type NoteCardProps = {
  note: BucketNote
}

export function NoteCard({ note }: NoteCardProps) {
  const navigate = useNavigate()
  const excerpt = getExcerpt(note)
  const thumbnail = getThumbnail(note)

  return (
    <button
      type="button"
      onClick={() => navigate(`/notes/${note.id}`)}
      className="group flex flex-col rounded-lg border border-surface-200 bg-surface-100 p-4 text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-surface-300 hover:shadow-elevated"
    >
      {/* Optional thumbnail */}
      {thumbnail && (
        <div className="-mx-4 -mt-4 mb-3 h-[120px] overflow-hidden rounded-t-lg">
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Source + Title */}
      <div className="flex items-center gap-2">
        <SourceIcon sourceType={note.source_type} size={14} />
        <span className="truncate text-title-sm text-surface-700 group-hover:text-surface-800">
          {note.title}
        </span>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <p className="mt-1.5 line-clamp-3 text-body-sm text-surface-400">{excerpt}</p>
      )}

      {/* Metadata row */}
      <div className="mt-auto flex items-center gap-3 pt-3">
        <StatusDot status={note.distillation_status} size={6} />
        <span className="font-mono text-[13px] text-surface-300">
          {formatRelativeTime(note.captured_at)}
        </span>
        {note.connection_count > 0 && (
          <span className="font-mono text-[13px] text-surface-300">
            {note.connection_count}↗
          </span>
        )}
        <span className="ml-auto text-body-sm text-surface-300 opacity-0 transition-opacity group-hover:opacity-100">
          Open →
        </span>
      </div>
    </button>
  )
}
