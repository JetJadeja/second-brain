import { getAllBuckets } from '@second-brain/db'

export async function getBucketPath(
  userId: string,
  bucketId: string | null | undefined,
): Promise<string | null> {
  if (!bucketId) return null

  const buckets = await getAllBuckets(userId)
  const bucketMap = new Map(buckets.map((b) => [b.id, b]))

  const parts: string[] = []
  let current = bucketMap.get(bucketId)

  while (current) {
    parts.unshift(current.name)
    current = current.parent_id ? bucketMap.get(current.parent_id) : undefined
  }

  return parts.length > 0 ? parts.join('/') : null
}
