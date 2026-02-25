import type { ParaType } from '@/types/enums'

export type ReviewSection = 'inbox' | 'projects' | 'areas' | 'connections' | 'orphans' | 'distillation'

export type ProjectItem = {
  id: string
  name: string
  note_count: number
  last_captured_at: string
  is_stale: boolean
}

export type AreaItem = {
  name: string
  note_count: number
  last_captured_days: number
}

export type ConnectionSuggestion = {
  id: string
  note_a: { id: string; title: string }
  note_b: { id: string; title: string }
  reason: string
}

export type OrphanNote = {
  id: string
  title: string
  bucket_name: string | null
  para_type: ParaType | null
  captured_at: string
}

export type DistillationNudge = {
  id: string
  title: string
  view_count: number
}

export type ReviewData = {
  inbox_count: number
  projects: ProjectItem[]
  areas: AreaItem[]
  connections: ConnectionSuggestion[]
  orphans: OrphanNote[]
  nudges: DistillationNudge[]
}
