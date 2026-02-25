import { createHash } from 'crypto'
import { getServiceClient } from '../client.js'
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
    .select('*')
    .eq('user_id', userId)
    .is('source_url', null)
    .gte('captured_at', cutoff)
    .order('captured_at', { ascending: false })

  if (error || !data) return null

  for (const note of data) {
    const hash = hashContent(note.original_content ?? '')
    if (hash === contentHash) return note as Note
  }

  return null
}

function hashContent(content: string): string {
  return createHash('sha256').update(content.slice(0, 500)).digest('hex')
}
