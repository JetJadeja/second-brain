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
  const { data, error } = await getServiceClient()
    .from('note_connections')
    .insert({
      user_id: userId,
      source_id: sourceId,
      target_id: targetId,
      type,
      similarity: similarity ?? null,
    })
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
): Promise<Array<{ id: string; title: string; similarity: number }>> {
  const sb = getServiceClient()

  const { data, error } = await sb
    .from('notes')
    .select('id, title, embedding')
    .eq('user_id', userId)
    .not('embedding', 'is', null)

  if (error || !data) return []

  // Compute cosine similarity in JS since Supabase JS
  // doesn't support order by vector distance directly
  const results: Array<{ id: string; title: string; similarity: number }> = []

  for (const note of data) {
    if (excludeNoteId && note.id === excludeNoteId) continue
    // embedding comes as a string representation from Supabase
    const noteEmb = note.embedding as unknown
    if (!noteEmb) continue

    // Parse if string
    const vec = typeof noteEmb === 'string'
      ? JSON.parse(noteEmb) as number[]
      : noteEmb as number[]

    const sim = cosineSimilarity(embedding, vec)
    results.push({ id: note.id as string, title: note.title as string, similarity: sim })
  }

  results.sort((a, b) => b.similarity - a.similarity)
  return results.slice(0, limit)
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!
    normA += a[i]! * a[i]!
    normB += b[i]! * b[i]!
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}
