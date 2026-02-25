import { useNavigate } from 'react-router-dom'
import { SourceIcon } from '@/components/shared/SourceIcon'
import { ParaDot } from '@/components/shared/ParaDot'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { SOURCE_LABELS } from '@/types/enums'
import type { NoteDetail } from '../types/note-detail.types'

type NoteMetadataProps = {
  note: NoteDetail
}

export function NoteMetadata({ note }: NoteMetadataProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-center gap-2 text-body-sm text-surface-400">
      {/* Source type */}
      <span className="flex items-center gap-1">
        <SourceIcon sourceType={note.source_type} size={14} />
        {SOURCE_LABELS[note.source_type]}
      </span>

      <span className="text-surface-200">·</span>

      {/* Capture time */}
      <span title={new Date(note.captured_at).toLocaleString()}>
        Captured {formatRelativeTime(note.captured_at)} ago
      </span>

      <span className="text-surface-200">·</span>

      {/* PARA location */}
      {note.bucket_id ? (
        <button
          type="button"
          onClick={() => navigate(`/buckets/${note.bucket_id}`)}
          className="flex items-center gap-1 rounded-sm bg-surface-150 px-1.5 py-0.5 text-caption text-surface-400 transition-colors hover:bg-surface-200"
        >
          <ParaDot type="area" size={6} />
          {note.bucket_path ?? 'Bucket'}
        </button>
      ) : (
        <span className="flex items-center gap-1 rounded-sm bg-surface-150 px-1.5 py-0.5 text-caption text-surface-300">
          <span className="inline-block size-1.5 rounded-full bg-surface-300" />
          Inbox
        </span>
      )}

      {/* View count */}
      {note.view_count > 1 && (
        <>
          <span className="text-surface-200">·</span>
          <span className="text-surface-300">Viewed {note.view_count} times</span>
        </>
      )}
    </div>
  )
}
