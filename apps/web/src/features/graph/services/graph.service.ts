import { apiClient } from '@/services/api-client'
import type { GraphData } from '../types/graph.types'

const MOCK_DATA: GraphData = {
  nodes: [
    { id: '1', title: 'React Patterns', source_type: 'article', bucket_id: 'b1', para_type: 'resource', connection_count: 5, captured_at: '2025-06-15T00:00:00Z', distillation: 'Key React patterns for state management', ai_summary: null, original_content: null },
    { id: '2', title: 'Project Alpha', source_type: 'thought', bucket_id: 'b2', para_type: 'project', connection_count: 8, captured_at: '2025-08-01T00:00:00Z', distillation: null, ai_summary: 'Overview of Project Alpha goals', original_content: null },
    { id: '3', title: 'Design Systems', source_type: 'article', bucket_id: 'b1', para_type: 'resource', connection_count: 3, captured_at: '2025-07-10T00:00:00Z', distillation: null, ai_summary: null, original_content: 'A deep dive into design systems' },
    { id: '4', title: 'Health Tracking', source_type: 'thought', bucket_id: 'b3', para_type: 'area', connection_count: 2, captured_at: '2025-09-01T00:00:00Z', distillation: null, ai_summary: null, original_content: null },
    { id: '5', title: 'Old Notes', source_type: 'thought', bucket_id: 'b4', para_type: 'archive', connection_count: 0, captured_at: '2025-03-01T00:00:00Z', distillation: null, ai_summary: null, original_content: null },
    { id: '6', title: 'Inbox Item', source_type: 'article', bucket_id: null, para_type: null, connection_count: 1, captured_at: '2025-11-01T00:00:00Z', distillation: null, ai_summary: null, original_content: null },
  ],
  edges: [
    { source_id: '1', target_id: '2', type: 'ai_detected', similarity: 0.78 },
    { source_id: '1', target_id: '3', type: 'explicit', similarity: null },
    { source_id: '2', target_id: '4', type: 'ai_detected', similarity: 0.65 },
    { source_id: '3', target_id: '6', type: 'ai_detected', similarity: 0.55 },
  ],
}

export const graphService = {
  async getGraphData(): Promise<GraphData> {
    try {
      return await apiClient.get<GraphData>('/graph')
    } catch {
      return MOCK_DATA
    }
  },
}
