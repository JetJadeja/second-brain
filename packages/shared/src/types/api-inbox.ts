import type { NoteSource } from './enums.js'

export interface InboxResponse {
  items: InboxItem[]
  total: number
  page: number
  limit: number
}

export interface InboxItem {
  id: string
  title: string
  original_content: string | null
  ai_summary: string | null
  source_type: NoteSource
  source: Record<string, unknown>
  ai_suggested_bucket: string | null
  ai_suggested_bucket_path: string | null
  tags: string[]
  user_note: string | null
  captured_at: string
  related_notes: Array<{
    id: string
    title: string
    similarity: number
  }>
}

export interface ClassifyRequest {
  bucket_id: string
}

export interface BatchClassifyRequest {
  classifications: Array<{
    note_id: string
    bucket_id: string
  }>
}
