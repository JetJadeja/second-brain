import type { ParaType, NoteSource, DistillationStatus } from './enums.js'

export interface DashboardResponse {
  inbox: {
    count: number
    recent: DashboardInboxItem[]
  }
  recent_and_relevant: DashboardNote[]
  areas: DashboardArea[]
}

export interface DashboardInboxItem {
  id: string
  title: string
  ai_summary: string | null
  source_type: NoteSource
  source: Record<string, unknown>
  ai_suggested_bucket: string | null
  ai_suggested_bucket_path: string | null
  ai_confidence: number | null
  captured_at: string
}

export interface DashboardNote {
  id: string
  title: string
  ai_summary: string | null
  distillation: string | null
  source_type: NoteSource
  source: Record<string, unknown>
  bucket_id: string | null
  bucket_path: string | null
  distillation_status: DistillationStatus
  captured_at: string
  connection_count: number
  relevance_reason?: string
}

export interface DashboardArea {
  id: string
  name: string
  type: ParaType
  note_count: number
  last_capture_at: string | null
  health: 'growing' | 'stable' | 'stagnant'
  children: Array<{
    id: string
    name: string
    note_count: number
  }>
}
