import type { NoteSource, DistillationStatus } from '@/types/enums'

export type NoteDetail = {
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

export type RelatedNote = {
  id: string
  title: string
  source_type: NoteSource
  similarity: number | null
  type: 'explicit' | 'ai_detected'
  context: string | null
}

export type NoteDetailResponse = {
  note: NoteDetail
  related_notes: RelatedNote[]
  backlinks: RelatedNote[]
}
