import { updateBucket, getBucketById } from '@second-brain/db'
import type { RenameBucketPayload } from '@second-brain/shared'

export async function executeRenameBucket(
  userId: string,
  payload: RenameBucketPayload,
): Promise<string[]> {
  const bucket = await getBucketById(userId, payload.bucket_id)
  if (!bucket) throw new Error(`Bucket not found: ${payload.bucket_id}`)

  await updateBucket(userId, payload.bucket_id, { name: payload.new_name })
  return []
}
