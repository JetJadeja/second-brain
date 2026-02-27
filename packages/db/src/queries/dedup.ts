import { getServiceClient } from '../client.js'
import { computeContentHash } from '@second-brain/shared'
import type { Note } from '@second-brain/shared'

export async function findExistingNoteByUrl(
  userId: string,
  sourceUrl: string,
): Promise<Note | null> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('source_url', sourceUrl)
    .limit(1)
    .single()

  if (error || !data) return null
  return data as Note
}

export async function findExistingNoteByContentHash(
  userId: string,
  contentHash: string,
  windowMinutes: number,
): Promise<Note | null> {
  const cutoff = new Date(
    Date.now() - windowMinutes * 60 * 1000,
  ).toISOString()

  const { data, error } = await getServiceClient()
    .from('notes')
    .select('id, original_content, title, ai_summary, source_type, source, user_note, bucket_id, is_classified, captured_at, source_url, key_points, distillation, distillation_status, is_original_thought, tags, view_count, connection_count, embedding')
    .eq('user_id', userId)
    .is('source_url', null)
    .gte('captured_at', cutoff)
    .order('captured_at', { ascending: false })
    .limit(100)

  if (error || !data) return null

  for (const note of data) {
    const hash = computeContentHash((note.original_content as string) ?? '')
    if (hash === contentHash) return note as Note
  }

  return null
}
