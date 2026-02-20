import type { DashboardNote } from '../../lib/types'
import { NoteCard } from './NoteCard'

interface NoteGridProps {
  notes: DashboardNote[]
}

export function NoteGrid({ notes }: NoteGridProps) {
  return (
    <div className="flex flex-col gap-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}
