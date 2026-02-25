import type {
  ParaType,
  NoteSource,
  DistillationStatus,
  ConnectionType,
  SuggestionType,
  SuggestionStatus,
} from './enums.js'

export interface ParaBucket {
  id: string
  user_id: string
  name: string
  type: ParaType
  parent_id: string | null
  description: string | null
  overview: string | null
  notes_at_last_overview: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  original_content: string | null
  ai_summary: string | null
  key_points: string[]
  distillation: string | null
  source_type: NoteSource
  source: Record<string, unknown>
  source_url: string | null
  user_note: string | null
  bucket_id: string | null
  ai_suggested_bucket: string | null
  ai_confidence: number | null
  is_classified: boolean
  is_original_thought: boolean
  tags: string[]
  distillation_status: DistillationStatus
  view_count: number
  last_viewed_at: string | null
  connection_count: number
  embedding?: unknown
  captured_at: string
  created_at: string
  updated_at: string
}

export interface NoteConnection {
  id: string
  user_id: string
  source_id: string
  target_id: string
  type: ConnectionType
  similarity: number | null
  context: string | null
  created_at: string
}

export interface Suggestion {
  id: string
  user_id: string
  type: SuggestionType
  payload: Record<string, unknown>
  status: SuggestionStatus
  created_at: string
}

export interface Synthesis {
  id: string
  user_id: string
  title: string
  content: string
  query: string | null
  source_note_ids: string[]
  bucket_id: string | null
  created_at: string
}

export interface TelegramLink {
  id: string
  user_id: string
  telegram_user_id: number
  telegram_username: string | null
  linked_at: string
}
