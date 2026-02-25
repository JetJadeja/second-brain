import type { NoteSource } from '@/types/enums'

export type InboxNoteItem = {
  item_type: 'note'
  id: string
  title: string
  source_type: NoteSource
  captured_at: string
  ai_summary: string | null
  ai_suggested_bucket: string | null
  ai_suggested_bucket_path: string | null
  ai_confidence: number | null
  tags: string[]
}

export type InboxSuggestionItem = {
  item_type: 'suggestion'
  id: string
  type: string
  payload: Record<string, unknown>
  description?: string
  created_at: string
}

export type InboxItem = InboxNoteItem | InboxSuggestionItem

export type InboxResponse = {
  items: InboxItem[]
  total: number
  page: number
  limit: number
}

export type BatchCluster = {
  bucketPath: string
  bucketId: string
  noteIds: string[]
  count: number
}
