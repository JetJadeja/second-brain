import type { ParaType, NoteSource, DistillationStatus } from '@/types/enums'

export type BucketDetail = {
  id: string
  name: string
  type: ParaType
  parent_id: string | null
  description: string | null
  is_active: boolean
}

export type BucketNote = {
  id: string
  title: string
  source_type: NoteSource
  captured_at: string
  ai_summary: string | null
  distillation_status: DistillationStatus
  tags: string[]
  view_count: number
  connection_count: number
  source: Record<string, unknown>
}

export type BucketPageResponse = {
  bucket: BucketDetail
  notes: BucketNote[]
  pagination: { page: number; limit: number; total: number }
}

export type ChildBucket = {
  id: string
  name: string
  type: ParaType
  note_count: number
}

export type SortOption = 'captured_at' | 'connection_count' | 'needs_attention'
