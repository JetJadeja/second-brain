import { apiClient } from '@/services/api-client'
import type { NoteDetailResponse } from '../types/note-detail.types'

export function getNote(noteId: string): Promise<NoteDetailResponse> {
  return apiClient.get<NoteDetailResponse>(`/notes/${noteId}`)
}

export function archiveNote(noteId: string): Promise<void> {
  return apiClient.post(`/inbox/${noteId}/archive`)
}

export function deleteNote(noteId: string): Promise<void> {
  return apiClient.delete(`/notes/${noteId}`)
}

export function updateNote(noteId: string, data: Record<string, unknown>): Promise<void> {
  return apiClient.patch(`/notes/${noteId}`, data)
}
