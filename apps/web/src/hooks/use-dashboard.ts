import { useQuery } from '@tanstack/react-query'
import type { DashboardResponse } from '../lib/types'
import { apiGet } from '../lib/api-client'

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardResponse>('/api/dashboard'),
  })
}
