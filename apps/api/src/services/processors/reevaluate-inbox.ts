import { getStaleInboxNotes, updateNote } from '@second-brain/db'
import type { NoteSource } from '@second-brain/shared'
import { classifyContent } from './classify-content.js'

type ReevalTrigger = 'create' | 'delete'

const MAX_NOTES = 20

export async function reevaluateInbox(
  userId: string,
  trigger: ReevalTrigger,
): Promise<void> {
  try {
    const filter = trigger === 'create' ? 'low_confidence' : 'no_suggestion'
    const notes = await getStaleInboxNotes(userId, filter, MAX_NOTES)

    if (notes.length === 0) return

    console.log(`[reevaluate] re-evaluating ${notes.length} inbox items (trigger: ${trigger})`)

    for (const note of notes) {
      try {
        const result = await classifyContent({
          userId,
          title: note.title,
          content: note.original_content ?? note.ai_summary ?? '',
          summary: note.ai_summary,
          sourceType: note.source_type as NoteSource,
          userNote: note.user_note,
        })

        if (!result) continue

        await updateNote(userId, note.id, {
          ai_suggested_bucket: result.bucket_id || null,
          ai_confidence: result.confidence,
        })
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`[reevaluate] failed for note ${note.id}:`, msg)
      }
    }

    console.log(`[reevaluate] done — processed ${notes.length} notes`)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[reevaluate] failed:', msg)
  }
}
