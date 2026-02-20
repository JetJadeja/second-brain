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
  let count = 0

  for (const item of items) {
    const { error } = await sb
      .from('notes')
      .update({ bucket_id: item.bucket_id, is_classified: true })
      .eq('id', item.note_id)
      .eq('user_id', userId)

    if (!error) count++
  }

  return count
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
