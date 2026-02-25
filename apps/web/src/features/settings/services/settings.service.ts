import { apiClient } from '@/services/api-client'

export const settingsService = {
  async disconnectTelegram(): Promise<void> {
    await apiClient.delete('/link/link')
  },
}
