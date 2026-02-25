import type { NoteSource, ParaType } from '@/types/enums'

export type GraphNode = {
  id: string
  title: string
  source_type: NoteSource
  bucket_id: string | null
  para_type: ParaType | null
  connection_count: number
  captured_at: string
  distillation: string | null
  ai_summary: string | null
  original_content: string | null
}

export type GraphEdge = {
  source_id: string
  target_id: string
  type: 'explicit' | 'ai_detected'
  similarity: number | null
}

export type GraphData = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export type ParaFilter = 'project' | 'area' | 'resource' | 'archive'

export type SimNode = GraphNode & {
  x: number
  y: number
  vx: number
  vy: number
}
