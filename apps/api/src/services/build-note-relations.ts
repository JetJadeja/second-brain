import { getNoteById } from '@second-brain/db'
import { getBucketPath } from './para-tree.js'
import type { NoteDetailResponse, NoteConnection } from '@second-brain/shared'

type RelatedNote = NoteDetailResponse['related_notes'][number]
type Backlink = NoteDetailResponse['backlinks'][number]

export interface NoteRelations {
  relatedNotes: RelatedNote[]
  backlinks: Backlink[]
}

/**
 * Builds related notes and backlinks from a note's connections.
 * Resolves each connected note and its bucket path.
 */
export async function buildNoteRelations(
  userId: string,
  noteId: string,
  connections: NoteConnection[],
): Promise<NoteRelations> {
  const relatedNotes: RelatedNote[] = []
  const backlinks: Backlink[] = []

  for (const conn of connections) {
    const otherId = conn.source_id === noteId ? conn.target_id : conn.source_id
    const otherNote = await getNoteById(userId, otherId)
    if (!otherNote) continue

    const otherPath = await getBucketPath(userId, otherNote.bucket_id)

    if (conn.target_id === noteId) {
      backlinks.push({
        id: otherNote.id,
        title: otherNote.title,
        bucket_path: otherPath,
      })
    }

    relatedNotes.push({
      id: otherNote.id,
      title: otherNote.title,
      ai_summary: otherNote.ai_summary,
      similarity: conn.similarity ?? 0,
      bucket_path: otherPath,
      connection_type: conn.type,
    })
  }

  return { relatedNotes, backlinks }
}
