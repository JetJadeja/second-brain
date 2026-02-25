import { apiClient } from '@/services/api-client'
import type { LinkCodeResponse, LinkStatusResponse } from '../types/telegram.types'

export function generateLinkCode(): Promise<LinkCodeResponse> {
  return apiClient.post<LinkCodeResponse>('/link/code')
}

export function getLinkStatus(): Promise<LinkStatusResponse> {
  return apiClient.get<LinkStatusResponse>('/link/status')
}
