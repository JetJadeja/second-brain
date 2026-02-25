import type { ParaType, NoteSource, DistillationStatus } from './enums.js'

export interface ParaTreeNode {
  id: string
  name: string
  type: ParaType
  parent_id: string | null
  description: string | null
  is_active: boolean
  sort_order: number
  note_count: number
  children: ParaTreeNode[]
}

export interface ParaTreeResponse {
  tree: ParaTreeNode[]
}

export interface BucketDetailResponse {
  bucket: {
    id: string
    name: string
    type: ParaType
    path: string
    description: string | null
    overview: string | null
    note_count: number
    distilled_count: number
    evergreen_count: number
    children: Array<{ id: string; name: string; note_count: number }>
  }
  notes: BucketNote[]
  total: number
  page: number
  limit: number
}

export interface BucketNote {
  id: string
  title: string
  ai_summary: string | null
  distillation: string | null
  source_type: NoteSource
  source: Record<string, unknown>
  distillation_status: DistillationStatus
  captured_at: string
  connection_count: number
  tags: string[]
}

export interface CreateBucketRequest {
  name: string
  type: ParaType
  parent_id: string
  description?: string
}

export interface UpdateBucketRequest {
  name?: string
  parent_id?: string
  sort_order?: number
  is_active?: boolean
  description?: string
}
