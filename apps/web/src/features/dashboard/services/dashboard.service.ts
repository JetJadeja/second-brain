import { apiClient } from '@/services/api-client'
import type { DashboardData } from '../types/dashboard.types'

export function getDashboard(): Promise<DashboardData> {
  return apiClient.get<DashboardData>('/dashboard')
}

export function classifyNote(noteId: string): Promise<void> {
  return apiClient.post(`/inbox/${noteId}/classify`)
}
