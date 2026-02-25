import type { NoteSource, DistillationStatus } from './enums.js'

export interface SearchRequest {
  query: string
  mode: 'notes' | 'answer'
  filters?: {
    bucket_id?: string
    source_type?: NoteSource
    distillation_status?: DistillationStatus
    after?: string
    before?: string
  }
  limit?: number
}

export interface SearchNotesResponse {
  mode: 'notes'
  results: SearchResult[]
  total_found: number
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  source_type: NoteSource
  source: Record<string, unknown>
  distillation_status: DistillationStatus
  bucket_id: string | null
  bucket_path: string | null
  captured_at: string
  connection_count: number
  similarity: number
  rank_score: number
}

export interface SearchAnswerResponse {
  mode: 'answer'
  answer: {
    text: string
    citations: Array<{
      index: number
      note_id: string
      title: string
      bucket_path: string | null
      captured_at: string
    }>
    gaps: string[]
  }
  source_notes: Array<{
    id: string
    title: string
    bucket_path: string | null
    captured_at: string
    is_original_thought: boolean
  }>
}
