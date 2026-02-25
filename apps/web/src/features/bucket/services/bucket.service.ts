import { apiClient } from '@/services/api-client'
import type { BucketPageResponse, SortOption } from '../types/bucket.types'
import type { ParaType } from '@/types/enums'

type ParaTreeNode = {
  id: string
  name: string
  type: string
  parent_id: string | null
  is_active: boolean
  sort_order: number
  note_count: number
  children: ParaTreeNode[]
}

type CreatedBucket = {
  id: string
  name: string
  type: ParaType
  parent_id: string
}

export function getBucket(
  bucketId: string, page = 1, limit = 20, sort: SortOption = 'captured_at',
): Promise<BucketPageResponse> {
  return apiClient.get<BucketPageResponse>(
    `/para/${bucketId}?page=${page}&limit=${limit}&sort=${sort}`,
  )
}

export function renameBucket(bucketId: string, name: string): Promise<void> {
  return apiClient.patch(`/para/buckets/${bucketId}`, { name })
}

export function deleteBucket(bucketId: string): Promise<void> {
  return apiClient.delete(`/para/buckets/${bucketId}`)
}

export function archiveBucket(bucketId: string): Promise<void> {
  return apiClient.patch(`/para/buckets/${bucketId}`, { type: 'archive' })
}

export function restoreBucket(bucketId: string): Promise<void> {
  return apiClient.patch(`/para/buckets/${bucketId}`, { type: 'project' })
}

export function getParaTree(): Promise<{ tree: ParaTreeNode[] }> {
  return apiClient.get<{ tree: ParaTreeNode[] }>('/para/tree')
}

export function createBucket(
  name: string, type: ParaType, parentId: string, description?: string,
): Promise<CreatedBucket> {
  return apiClient.post<CreatedBucket>('/para/buckets', {
    name, type, parent_id: parentId, description,
  })
}
