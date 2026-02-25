import type { NoteSource, DistillationStatus } from '@/types/enums'

export type SearchMode = 'notes' | 'ask'

export type PaletteMode = 'pre-search' | 'notes' | 'ask' | 'command'

export type TimeRange = 'any' | 'day' | 'week' | 'month' | 'year'

export type SearchFilters = {
  sourceType?: NoteSource
  bucketId?: string
  timeRange?: TimeRange
  distillationStatus?: DistillationStatus
}

export type SearchResult = {
  id: string
  title: string
  ai_summary: string | null
  source_type: NoteSource
  bucket_id: string | null
  bucket_path: string | null
  captured_at: string
  similarity: number
  rank_score: number
}

export type SearchResponse = {
  mode: 'notes'
  results: SearchResult[]
  total_found: number
}

export type AskCitation = {
  index: number
  note_id: string
  title: string
  bucket_path: string | null
  captured_at: string
}

export type AskAnswer = {
  text: string
  citations: AskCitation[]
  gaps: string[]
}

export type AskSourceNote = {
  id: string
  title: string
  source_type: NoteSource
  captured_at: string
}

export type AskResponse = {
  mode: 'answer'
  answer: AskAnswer
  source_notes: AskSourceNote[]
}

export type PaletteCommand = {
  id: string
  label: string
  description: string
  shortcut?: string
}
