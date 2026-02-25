import { apiClient } from '@/services/api-client'
import type { Highlight, DistillAction, AiAssistResponse } from '../types/distillation.types'

const MOCK_HIGHLIGHTS: Highlight[] = [
  { start: 0, end: 120, reason: 'Key thesis statement' },
  { start: 200, end: 350, reason: 'Supporting evidence' },
  { start: 500, end: 650, reason: 'Novel insight' },
]

export const distillationService = {
  async getHighlights(noteId: string): Promise<Highlight[]> {
    try {
      const res = await apiClient.post<{ highlights: Highlight[] }>(`/notes/${noteId}/highlights`, {})
      return res.highlights
    } catch {
      return MOCK_HIGHLIGHTS
    }
  },

  async distillAssist(noteId: string, action: DistillAction): Promise<AiAssistResponse> {
    try {
      return await apiClient.post<AiAssistResponse>(`/notes/${noteId}/distill-assist`, { action })
    } catch {
      return { text: `[AI ${action} placeholder — endpoint not available]` }
    }
  },
}
