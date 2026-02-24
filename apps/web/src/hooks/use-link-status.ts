import { useQuery } from '@tanstack/react-query'
import { apiGet } from '../lib/api-client'
import type { LinkStatusResponse } from '../lib/types'

interface LinkStatus {
  isLinked: boolean
  isLoading: boolean
  username: string | null
}

export function useLinkStatus(): LinkStatus {
  const { data, isLoading } = useQuery<LinkStatusResponse>({
    queryKey: ['link-status'],
    queryFn: () => apiGet<LinkStatusResponse>('/api/link/status'),
  })

  return {
    isLinked: isLoading ? true : (data?.linked ?? true),
    isLoading,
    username: data?.telegram_username ?? null,
  }
}
