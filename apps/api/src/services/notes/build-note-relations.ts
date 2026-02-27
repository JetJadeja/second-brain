import { getNotesByIds } from '@second-brain/db'
import { getBucketPath } from '../para/para-cache.js'
import type { Note, NoteDetailResponse, NoteConnection } from '@second-brain/shared'

type RelatedNote = NoteDetailResponse['related_notes'][number]
type Backlink = NoteDetailResponse['backlinks'][number]

export interface NoteRelations {
  relatedNotes: RelatedNote[]
  backlinks: Backlink[]
}

/**
 * Builds related notes and backlinks from a note's connections.
 * Batch-fetches all connected notes in a single query.
 */
export async function buildNoteRelations(
  userId: string,
  noteId: string,
  connections: NoteConnection[],
): Promise<NoteRelations> {
  if (connections.length === 0) return { relatedNotes: [], backlinks: [] }

  const otherIds = [
    ...new Set(
      connections.map((c) => (c.source_id === noteId ? c.target_id : c.source_id)),
    ),
  ]

  const notes = await getNotesByIds(userId, otherIds)
  const noteMap = new Map<string, Note>(notes.map((n) => [n.id, n]))

  const relatedMap = new Map<string, RelatedNote>()
  const backlinkIds = new Set<string>()
  const backlinks: Backlink[] = []

  for (const conn of connections) {
    const otherId = conn.source_id === noteId ? conn.target_id : conn.source_id
    const otherNote = noteMap.get(otherId)
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
