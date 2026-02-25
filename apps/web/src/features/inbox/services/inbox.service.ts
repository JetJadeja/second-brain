import { apiClient } from '@/services/api-client'
import type { InboxResponse } from '../types/inbox.types'

export function getInbox(page = 1, limit = 20): Promise<InboxResponse> {
  return apiClient.get<InboxResponse>(`/inbox?page=${page}&limit=${limit}`)
}

export function classifyNote(noteId: string, bucketId: string): Promise<void> {
  return apiClient.post(`/inbox/${noteId}/classify`, { bucket_id: bucketId })
}

export function batchClassify(classifications: Array<{ note_id: string; bucket_id: string }>): Promise<void> {
  return apiClient.post('/inbox/batch-classify', { classifications })
}

export function archiveNote(noteId: string): Promise<void> {
  return apiClient.post(`/inbox/${noteId}/archive`)
}

export function deleteNote(noteId: string): Promise<void> {
  return apiClient.delete(`/inbox/${noteId}`)
}

export type AcceptSuggestionResponse = { affected_note_ids: string[] }

export function acceptSuggestion(id: string): Promise<AcceptSuggestionResponse> {
  return apiClient.post<AcceptSuggestionResponse>(`/suggestions/${id}/accept`)
}

export function dismissSuggestion(id: string): Promise<void> {
  return apiClient.post(`/suggestions/${id}/dismiss`)
}
