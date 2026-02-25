import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNoteDetail } from '@/features/note-detail/hooks/useNoteDetail'
import { NoteTitle } from '@/features/note-detail/components/NoteTitle'
import { NoteMetadata } from '@/features/note-detail/components/NoteMetadata'
import { NoteActions } from '@/features/note-detail/components/NoteActions'
import { DistillationBar } from '@/features/note-detail/components/DistillationBar'
import { ContentSection } from '@/features/note-detail/components/ContentSection'
import { DistillationContent } from '@/features/note-detail/components/DistillationContent'
import { KeyPointsList } from '@/features/note-detail/components/KeyPointsList'
import { AiSummaryCard } from '@/features/note-detail/components/AiSummaryCard'
import { OriginalContent } from '@/features/note-detail/components/OriginalContent'
import { ContextPanel } from '@/features/note-detail/components/ContextPanel'
import { RelatedNotesList } from '@/features/note-detail/components/RelatedNotesList'
import { BacklinksList } from '@/features/note-detail/components/BacklinksList'
import { SourceMetadata } from '@/features/note-detail/components/SourceMetadata'
import { AskInput } from '@/features/note-detail/components/AskInput'
import { NoteDetailSkeleton } from '@/features/note-detail/components/NoteDetailSkeleton'

export function NoteDetailPage() {
  const { note, relatedNotes, backlinks, isLoading, error, archive, deleteNote, copyLink } = useNoteDetail()
  const navigate = useNavigate()
  const [panelCollapsed, setPanelCollapsed] = useState(false)

  if (isLoading) return <NoteDetailSkeleton />

  if (error || !note) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-body text-surface-500">{error ?? 'Note not found'}</p>
        <button type="button" onClick={() => navigate('/home')} className="text-body-sm text-ember-500 hover:underline">
          Go to Dashboard
        </button>
      </div>
    )
  }

  const sourceUrl = typeof note.source['url'] === 'string' ? note.source['url'] : null
  const hasDistillation = note.distillation !== null
  const hasKeyPoints = note.key_points.length > 0
  const isRaw = !hasDistillation && !hasKeyPoints

  return (
    <div className="flex h-full">
      {/* Center panel */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-[720px] space-y-4">
          <NoteTitle title={note.title} sourceUrl={sourceUrl} />
          <NoteMetadata note={note} />
          <NoteActions noteId={note.id} onArchive={archive} onDelete={deleteNote} onCopyLink={copyLink} />
          <DistillationBar status={note.distillation_status} noteId={note.id} />

          <div className="space-y-6 pt-2">
            {/* Distilled note layout */}
            {hasDistillation && (
              <ContentSection title="Distillation" collapsible={false}>
                <DistillationContent text={note.distillation!} />
              </ContentSection>
            )}

            {hasKeyPoints && (
              <ContentSection title="Key Points">
                <KeyPointsList points={note.key_points} />
              </ContentSection>
            )}

            {note.ai_summary && (
              <ContentSection title="AI Summary" defaultOpen={isRaw}>
                <AiSummaryCard summary={note.ai_summary} />
              </ContentSection>
            )}

            <ContentSection title="Original" defaultOpen={isRaw}>
              <OriginalContent note={note} />
            </ContentSection>
          </div>
        </div>
      </div>

      {/* Context panel */}
      <div className="relative">
        <ContextPanel collapsed={panelCollapsed} onToggle={() => setPanelCollapsed((v) => !v)}>
          <RelatedNotesList notes={relatedNotes} />
          <BacklinksList backlinks={backlinks} />
          <SourceMetadata
            sourceType={note.source_type}
            source={note.source}
            capturedAt={note.captured_at}
            tags={note.tags}
          />
          <AskInput />
        </ContextPanel>
      </div>
    </div>
  )
}
