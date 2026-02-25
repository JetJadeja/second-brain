import { apiClient } from '@/services/api-client'
import type { DashboardData } from '../types/dashboard.types'

export function getDashboard(): Promise<DashboardData> {
  return apiClient.get<DashboardData>('/dashboard')
}

export function classifyNote(noteId: string, bucketId: string): Promise<void> {
  return apiClient.post(`/inbox/${noteId}/classify`, { bucket_id: bucketId })
}

export function archiveNote(noteId: string): Promise<void> {
  return apiClient.post(`/inbox/${noteId}/archive`)
}
