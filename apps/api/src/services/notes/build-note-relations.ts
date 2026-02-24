import { getNoteById } from '@second-brain/db'
import { getBucketPath } from '../para/para-cache.js'
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
  const relatedMap = new Map<string, RelatedNote>()
  const backlinkIds = new Set<string>()
  const backlinks: Backlink[] = []

  for (const conn of connections) {
    const otherId = conn.source_id === noteId ? conn.target_id : conn.source_id
    const otherNote = await getNoteById(userId, otherId)
    if (!otherNote) continue

    const otherPath = await getBucketPath(userId, otherNote.bucket_id)
    const similarity = conn.similarity ?? 0

    if (conn.target_id === noteId && !backlinkIds.has(otherNote.id)) {
      backlinkIds.add(otherNote.id)
      backlinks.push({
        id: otherNote.id,
        title: otherNote.title,
        bucket_path: otherPath,
      })
    }

    const existing = relatedMap.get(otherNote.id)
    if (!existing || similarity > existing.similarity) {
      relatedMap.set(otherNote.id, {
        id: otherNote.id,
        title: otherNote.title,
        ai_summary: otherNote.ai_summary,
        similarity,
        bucket_path: otherPath,
        connection_type: conn.type,
      })
    }
  }

  return { relatedNotes: [...relatedMap.values()], backlinks }
}
