import { getAllBuckets } from '@second-brain/db'
import { BoundedMap } from '../bounded-map.js'

const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes
const MAX_CACHED_USERS = 200

interface BucketEntry {
  id: string
  name: string
  parent_id: string | null
}

const bucketCache = new BoundedMap<BucketEntry[]>(CACHE_TTL_MS, MAX_CACHED_USERS)

async function fetchBuckets(userId: string): Promise<BucketEntry[]> {
  const cached = bucketCache.get(userId)
  if (cached) return cached

  const buckets = await getAllBuckets(userId)
  bucketCache.set(userId, buckets)
  return buckets
}

export async function getBucketPath(
  userId: string,
  bucketId: string | null | undefined,
): Promise<string | null> {
  if (!bucketId) return null

  const buckets = await fetchBuckets(userId)
  const bucketMap = new Map(buckets.map((b) => [b.id, b]))

  const parts: string[] = []
  let current = bucketMap.get(bucketId)

  while (current) {
    parts.unshift(current.name)
    current = current.parent_id ? bucketMap.get(current.parent_id) : undefined
  }

  return parts.length > 0 ? parts.join('/') : null
}
