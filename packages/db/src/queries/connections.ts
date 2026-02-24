import { getServiceClient } from '../client.js'
import type { NoteConnection } from '@second-brain/shared'

export async function getConnectionsForNote(
  userId: string,
  noteId: string,
): Promise<NoteConnection[]> {
  const { data, error } = await getServiceClient()
    .from('note_connections')
    .select('*')
    .eq('user_id', userId)
    .or(`source_id.eq.${noteId},target_id.eq.${noteId}`)

  if (error) throw new Error(`getConnectionsForNote: ${error.message}`)
  return (data ?? []) as NoteConnection[]
}

export async function createConnection(
  userId: string,
  sourceId: string,
  targetId: string,
  type: 'explicit' | 'ai_detected' = 'explicit',
  similarity?: number,
): Promise<NoteConnection> {
  // Normalize direction: smaller UUID is always source_id.
  // This prevents bidirectional duplicates (A→B and B→A).
  const [normalizedSource, normalizedTarget] =
    sourceId < targetId ? [sourceId, targetId] : [targetId, sourceId]

  const { data, error } = await getServiceClient()
    .from('note_connections')
    .upsert(
      {
        user_id: userId,
        source_id: normalizedSource,
        target_id: normalizedTarget,
        type,
        similarity: similarity ?? null,
      },
      { onConflict: 'source_id,target_id' },
    )
    .select()
    .single()

  if (error) throw new Error(`createConnection: ${error.message}`)
  return data as NoteConnection
}

export async function findSimilarNotes(
  userId: string,
  embedding: number[],
  excludeNoteId?: string,
  limit: number = 5,
  similarityThreshold: number = 0,
): Promise<Array<{ id: string; title: string; similarity: number }>> {
  const { data, error } = await getServiceClient().rpc('find_similar_notes', {
    p_user_id: userId,
    p_query_embedding: embedding,
    p_exclude_note_id: excludeNoteId ?? null,
    p_match_count: limit,
    p_similarity_threshold: similarityThreshold,
  })

  if (error) {
    console.error(`findSimilarNotes: ${error.message}`)
    return []
  }

  return (data ?? []) as Array<{ id: string; title: string; similarity: number }>
}
