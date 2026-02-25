import { deleteBucket, getBucketById } from '@second-brain/db'
import type { DeleteBucketPayload } from '@second-brain/shared'

export async function executeDeleteBucket(
  userId: string,
  payload: DeleteBucketPayload,
): Promise<string[]> {
  const bucket = await getBucketById(userId, payload.bucket_id)
  if (!bucket) throw new Error(`Bucket not found: ${payload.bucket_id}`)

  await deleteBucket(userId, payload.bucket_id)
  return []
}
