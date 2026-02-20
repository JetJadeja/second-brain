import { useQuery } from '@tanstack/react-query'
import type { ParaTreeResponse } from '../lib/types'
import { apiGet } from '../lib/api-client'

export function useParaTree() {
  return useQuery<ParaTreeResponse>({
    queryKey: ['para-tree'],
    queryFn: () => apiGet<ParaTreeResponse>('/api/para/tree'),
  })
}
