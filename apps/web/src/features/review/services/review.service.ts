import { apiClient } from '@/services/api-client'
import type { ReviewData } from '../types/review.types'

const MOCK_DATA: ReviewData = {
  inbox_count: 3,
  projects: [
    { id: 'p1', name: 'Second Brain App', note_count: 24, last_captured_at: '2026-02-20T00:00:00Z', is_stale: false },
    { id: 'p2', name: 'Trading System', note_count: 8, last_captured_at: '2025-12-01T00:00:00Z', is_stale: true },
  ],
  areas: [
    { name: 'Health', note_count: 15, last_captured_days: 3 },
    { name: 'Finance', note_count: 42, last_captured_days: 1 },
    { name: 'Relationships', note_count: 5, last_captured_days: 45 },
  ],
  connections: [
    { id: 's1', note_a: { id: 'n1', title: 'React Patterns' }, note_b: { id: 'n2', title: 'Component Design' }, reason: 'Both discuss composition patterns in UI development.' },
  ],
  orphans: [
    { id: 'o1', title: 'Random Thought', bucket_name: 'Ideas', para_type: 'resource', captured_at: '2026-02-15T00:00:00Z' },
  ],
  nudges: [
    { id: 'd1', title: 'The Art of Systems Thinking', view_count: 7 },
    { id: 'd2', title: 'DeFi Yield Strategies', view_count: 3 },
  ],
}

export const reviewService = {
  async getReviewData(): Promise<ReviewData> {
    try {
      return await apiClient.get<ReviewData>('/review')
    } catch {
      return MOCK_DATA
    }
  },

  async archiveProject(bucketId: string): Promise<void> {
    await apiClient.patch(`/para/buckets/${bucketId}`, { is_active: false })
  },

  async connectNotes(noteAId: string, noteBId: string): Promise<void> {
    await apiClient.post(`/notes/${noteAId}/connect`, { target_note_id: noteBId })
  },

  async dismissSuggestion(suggestionId: string): Promise<void> {
    await apiClient.post(`/suggestions/${suggestionId}/dismiss`, {})
  },

  async archiveNote(noteId: string): Promise<void> {
    await apiClient.patch(`/notes/${noteId}`, { is_archived: true })
  },
}
