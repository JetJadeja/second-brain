import { getServiceClient } from '../client.js'
import type { Note, NoteSource, DistillationStatus } from '@second-brain/shared'

export interface GetNotesOptions {
  page?: number
  limit?: number
  sourceType?: NoteSource
  status?: DistillationStatus
  sort?: string
}

export async function getRecentNotes(
  userId: string,
  opts: GetNotesOptions = {},
): Promise<{ data: Note[]; total: number }> {
  const page = opts.page ?? 1
  const limit = opts.limit ?? 20
  const offset = (page - 1) * limit

  let query = getServiceClient()
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_classified', true)

  if (opts.sourceType) query = query.eq('source_type', opts.sourceType)
  if (opts.status) query = query.eq('distillation_status', opts.status)

  query = query.order('captured_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw new Error(`getRecentNotes: ${error.message}`)

  return { data: (data ?? []) as Note[], total: count ?? 0 }
}

export async function getNotesByBucket(
  userId: string,
  bucketId: string,
  opts: GetNotesOptions = {},
): Promise<{ data: Note[]; total: number }> {
  const page = opts.page ?? 1
  const limit = opts.limit ?? 20
  const offset = (page - 1) * limit

  let query = getServiceClient()
    .from('notes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('bucket_id', bucketId)

  if (opts.sourceType) query = query.eq('source_type', opts.sourceType)
  if (opts.status) query = query.eq('distillation_status', opts.status)

  const sortColumn = opts.sort === 'alphabetical' ? 'title' : 'captured_at'
  const ascending = opts.sort === 'alphabetical'
  query = query.order(sortColumn, { ascending }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw new Error(`getNotesByBucket: ${error.message}`)

  return { data: (data ?? []) as Note[], total: count ?? 0 }
}
