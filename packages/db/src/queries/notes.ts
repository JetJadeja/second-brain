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
