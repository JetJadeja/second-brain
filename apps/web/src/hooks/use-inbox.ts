import { useQuery } from '@tanstack/react-query'
import type { InboxResponse } from '../lib/types'
import { apiGet } from '../lib/api-client'

export function useInbox(page = 1, limit = 50) {
  return useQuery<InboxResponse>({
    queryKey: ['inbox', page, limit],
    queryFn: () => apiGet<InboxResponse>(`/api/inbox?page=${page}&limit=${limit}`),
  })
}
