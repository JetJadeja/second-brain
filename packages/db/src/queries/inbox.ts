import { getServiceClient } from '../client.js'
import type { Note } from '@second-brain/shared'

export async function getInboxNotes(
  userId: string,
  opts: { page?: number; limit?: number; sort?: string } = {},
): Promise<{ data: Note[]; total: number }> {
  const page = opts.page ?? 1
  const limit = opts.limit ?? 20
  const offset = (page - 1) * limit

  const { data, count, error } = await getServiceClient()
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_classified', false)
    .order('captured_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`getInboxNotes: ${error.message}`)
  return { data: (data ?? []) as Note[], total: count ?? 0 }
}

export async function countInboxNotes(userId: string): Promise<number> {
  const { count, error } = await getServiceClient()
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_classified', false)

  if (error) throw new Error(`countInboxNotes: ${error.message}`)
  return count ?? 0
}

export async function classifyNote(
  userId: string,
  noteId: string,
  bucketId: string,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('notes')
    .update({ bucket_id: bucketId, is_classified: true })
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) throw new Error(`classifyNote: ${error.message}`)
}

export async function batchClassify(
  userId: string,
  items: Array<{ note_id: string; bucket_id: string }>,
): Promise<number> {
  const sb = getServiceClient()

  const noteIds = items.map((i) => i.note_id)
  const { data: notes, error: fetchError } = await sb
    .from('notes')
    .select('id')
    .eq('user_id', userId)
    .in('id', noteIds)

  if (fetchError) throw new Error(`batchClassify fetch: ${fetchError.message}`)
  const ownedIds = new Set((notes ?? []).map((n) => n.id))

  const grouped = new Map<string, string[]>()
  for (const item of items) {
    if (!ownedIds.has(item.note_id)) continue
    const ids = grouped.get(item.bucket_id) ?? []
    ids.push(item.note_id)
    grouped.set(item.bucket_id, ids)
  }

  let count = 0
  for (const [bucketId, ids] of grouped) {
    const { error } = await sb
      .from('notes')
      .update({ bucket_id: bucketId, is_classified: true })
      .eq('user_id', userId)
      .in('id', ids)

    if (!error) count += ids.length
  }

  return count
}

export async function getStaleInboxNotes(
  userId: string,
  filter: 'low_confidence' | 'no_suggestion',
  limit = 20,
): Promise<Note[]> {
  const sb = getServiceClient()
  let query = sb
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_classified', false)
    .order('captured_at', { ascending: false })
    .limit(limit)

  if (filter === 'low_confidence') {
    query = query.or('ai_confidence.lt.0.7,ai_suggested_bucket.is.null')
  } else {
    query = query.is('ai_suggested_bucket', null)
  }

  const { data, error } = await query
  if (error) throw new Error(`getStaleInboxNotes: ${error.message}`)
  return (data ?? []) as Note[]
}

export async function archiveNote(
  userId: string,
  noteId: string,
  archiveBucketId: string,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('notes')
    .update({ bucket_id: archiveBucketId, is_classified: true })
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) throw new Error(`archiveNote: ${error.message}`)
}
