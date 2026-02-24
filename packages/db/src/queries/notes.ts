import { getServiceClient } from '../client.js'
import type { Note, NoteSource, DistillationStatus } from '@second-brain/shared'

export async function getNoteById(
  userId: string,
  noteId: string,
): Promise<Note | null> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as Note
}

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

export interface CreateNoteInput {
  user_id: string
  title: string
  original_content?: string | null
  ai_summary?: string | null
  key_points?: string[]
  source_type: NoteSource
  source?: Record<string, unknown>
  user_note?: string | null
  bucket_id?: string | null
  ai_suggested_bucket?: string | null
  ai_confidence?: number | null
  is_classified?: boolean
  is_original_thought?: boolean
  tags?: string[]
  embedding?: number[] | null
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(`createNote: ${error.message}`)
  return data as Note
}

export async function updateNote(
  userId: string,
  noteId: string,
  fields: Partial<Note>,
): Promise<Note> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .update(fields)
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`updateNote: ${error.message}`)
  return data as Note
}

export async function deleteNote(
  userId: string,
  noteId: string,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) throw new Error(`deleteNote: ${error.message}`)
}

export async function incrementViewCount(
  userId: string,
  noteId: string,
): Promise<void> {
  const sb = getServiceClient()

  const { data: note } = await sb
    .from('notes')
    .select('view_count')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (note) {
    await sb
      .from('notes')
      .update({
        view_count: (note.view_count as number) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', noteId)
  }
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

