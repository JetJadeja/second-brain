import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Network } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RelatedNote } from '../types/note-detail.types'

type RelatedNotesListProps = {
  notes: RelatedNote[]
}

const MAX_VISIBLE = 8

export function RelatedNotesList({ notes }: RelatedNotesListProps) {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? notes : notes.slice(0, MAX_VISIBLE)

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <Network size={14} className="text-surface-300" />
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300">Related</span>
      </div>

      {notes.length === 0 ? (
        <p className="text-caption text-surface-300">No connections yet. Connections will appear as you add more notes.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => navigate(`/notes/${note.id}`)}
              className="group flex w-full items-start gap-2 rounded-sm text-left transition-colors duration-75 hover:bg-surface-150"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-surface-600">{note.title}</p>
                {note.context && (
                  <p className="truncate text-caption text-surface-400">{note.context}</p>
                )}
              </div>
              {note.similarity !== null && (
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <div className="h-[3px] w-10 overflow-hidden rounded-full bg-surface-200">
                    <div
                      className={cn('h-full rounded-full', note.similarity > 0.8 ? 'bg-ember-500' : 'bg-surface-400')}
                      style={{ width: `${note.similarity * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-surface-300">
                    {Math.round(note.similarity * 100)}%
                  </span>
                </div>
              )}
            </button>
          ))}

          {notes.length > MAX_VISIBLE && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-body-sm text-ember-500 hover:underline"
            >
              Show all ({notes.length}) ↓
            </button>
          )}
        </div>
      )}
    </div>
  )
}
