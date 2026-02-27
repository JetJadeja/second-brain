import { getServiceClient } from '../client.js'
import type { Note, NoteSource } from '@second-brain/shared'

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

export async function getNotesByIds(
  userId: string,
  noteIds: string[],
): Promise<Note[]> {
  if (noteIds.length === 0) return []

  const { data, error } = await getServiceClient()
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .in('id', noteIds)

  if (error) throw new Error(`getNotesByIds: ${error.message}`)
  return (data ?? []) as Note[]
}

export interface CreateNoteInput {
  user_id: string
  title: string
  original_content?: string | null
  ai_summary?: string | null
  key_points?: string[]
  source_type: NoteSource
  source?: Record<string, unknown>
  source_url?: string | null
  user_note?: string | null
  bucket_id?: string | null
  ai_suggested_bucket?: string | null
  ai_confidence?: number | null
  is_classified?: boolean
  is_original_thought?: boolean
  tags?: string[]
  embedding?: number[] | null
}

export interface CreateNoteResult {
  note: Note
  alreadyExisted: boolean
}

export async function createNote(input: CreateNoteInput): Promise<CreateNoteResult> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .insert(input)
    .select()
    .single()

  if (error) {
    if (isUniqueViolation(error) && input.source_url) {
      const existing = await findBySourceUrl(input.user_id, input.source_url)
      if (existing) return { note: existing, alreadyExisted: true }
    }
    throw new Error(`createNote: ${error.message}`)
  }

  return { note: data as Note, alreadyExisted: false }
}

function isUniqueViolation(error: { code?: string; message?: string }): boolean {
  return error.code === '23505' || (error.message?.includes('unique') ?? false)
}

async function findBySourceUrl(userId: string, sourceUrl: string): Promise<Note | null> {
  const { data } = await getServiceClient()
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('source_url', sourceUrl)
    .limit(1)
    .single()

  return (data as Note) ?? null
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
