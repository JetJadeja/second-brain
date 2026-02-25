import type { NoteSource, ParaType } from '@/types/enums'

export type DashboardInboxItem = {
  id: string
  title: string
  source_type: NoteSource
  captured_at: string
  ai_summary: string | null
  ai_suggested_bucket: string | null
  ai_suggested_bucket_path: string | null
}

export type DashboardContentItem = {
  id: string
  title: string
  source_type: NoteSource
  captured_at: string
  ai_summary: string | null
  bucket_id: string | null
  bucket_path: string | null
}

export type DashboardArea = {
  id: string
  name: string
  type: ParaType
  note_count: number
  children: Array<{ id: string; name: string; note_count: number }>
  health: 'growing' | 'stable' | 'stagnant'
}

export type DashboardData = {
  inbox: { count: number; recent: DashboardInboxItem[] }
  recent_and_relevant: DashboardContentItem[]
  areas: DashboardArea[]
}

export type FeedItem =
  | { type: 'capture'; item: DashboardInboxItem }
  | { type: 'recent'; item: DashboardContentItem }
  | { type: 'suggestion'; id: string; text: string }
