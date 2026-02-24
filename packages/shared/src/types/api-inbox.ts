import type { NoteSource, SuggestionType } from './enums.js'

export interface InboxResponse {
  items: UnifiedInboxItem[]
  total: number
  page: number
  limit: number
}

export type UnifiedInboxItem =
  | { kind: 'note'; data: InboxItem }
  | { kind: 'suggestion'; data: SuggestionItem }

export interface SuggestionItem {
  id: string
  type: SuggestionType
  payload: Record<string, unknown>
  description: string
  created_at: string
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
