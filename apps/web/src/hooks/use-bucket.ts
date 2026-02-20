import { useQuery } from '@tanstack/react-query'
import type { BucketDetailResponse } from '../lib/types'
import { apiGet } from '../lib/api-client'

export function useBucket(bucketId: string | undefined, page = 1, limit = 20) {
  return useQuery<BucketDetailResponse>({
    queryKey: ['bucket', bucketId, page, limit],
    queryFn: () => apiGet<BucketDetailResponse>(`/api/para/${bucketId}?page=${page}&limit=${limit}`),
    enabled: !!bucketId,
  })
}
