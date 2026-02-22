import type {
  ParaType,
  NoteSource,
  DistillationStatus,
  ConnectionType,
} from './enums.js'

// === Dashboard ===

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

// === Inbox ===

export interface InboxResponse {
  items: InboxItem[]
  total: number
  page: number
  limit: number
}

export interface InboxItem {
  id: string
  title: string
  original_content: string | null
  ai_summary: string | null
  source_type: NoteSource
  source: Record<string, unknown>
  ai_suggested_bucket: string | null
  ai_suggested_bucket_path: string | null
  tags: string[]
  user_note: string | null
  captured_at: string
  related_notes: Array<{
    id: string
    title: string
    similarity: number
  }>
}

export interface ClassifyRequest {
  bucket_id: string
}

export interface BatchClassifyRequest {
  classifications: Array<{
    note_id: string
    bucket_id: string
  }>
}

// === PARA ===

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

// === Notes ===

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

// === Search ===

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

// === Link Code ===

export interface LinkCodeResponse {
  code: string
  expires_at: string
}

export interface LinkStatusResponse {
  linked: boolean
  telegram_username?: string
}

// === Suggestions ===

export interface SuggestionsResponse {
  suggestions: Array<{
    id: string
    type: string
    payload: Record<string, unknown>
    created_at: string
  }>
}
