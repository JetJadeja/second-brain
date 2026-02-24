import type { NoteSource, DistillationStatus, ConnectionType } from './enums.js'

export interface NoteDetailResponse {
  note: {
    id: string
    title: string
    original_content: string | null
    ai_summary: string | null
    key_points: string[]
    distillation: string | null
    source_type: NoteSource
    source: Record<string, unknown>
    user_note: string | null
    bucket_id: string | null
    bucket_path: string | null
    distillation_status: DistillationStatus
    is_original_thought: boolean
    tags: string[]
    captured_at: string
    view_count: number
    connection_count: number
  }
  related_notes: Array<{
    id: string
    title: string
    ai_summary: string | null
    similarity: number
    bucket_path: string | null
    connection_type: ConnectionType
  }>
  backlinks: Array<{
    id: string
    title: string
    bucket_path: string | null
  }>
}

export interface UpdateNoteRequest {
  title?: string
  bucket_id?: string
  tags?: string[]
  distillation?: string
  distillation_status?: DistillationStatus
  key_points?: string[]
}

export interface ConnectNotesRequest {
  target_note_id: string
}
