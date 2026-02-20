import { useParams } from 'react-router-dom'
import { useNote } from '../hooks/use-note'
import { NoteContent } from '../components/note/NoteContent'
import { NoteContext } from '../components/note/NoteContext'

export default function NotePage() {
  const { noteId } = useParams<{ noteId: string }>()
  const { data, isLoading, error } = useNote(noteId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-text-tertiary">Loading note...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-red-500">Failed to load note</span>
      </div>
    )
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <NoteContent note={data.note} />
      </div>
      <div className="w-72 flex-shrink-0">
        <NoteContext
          relatedNotes={data.related_notes}
          backlinks={data.backlinks}
          source={data.note.source}
          sourceType={data.note.source_type}
        />
      </div>
    </div>
  )
}
