import { getBucketById, deleteBucket } from '@second-brain/db'
import { getServiceClient } from '@second-brain/db'
import type { MergeBucketsPayload } from '@second-brain/shared'

export async function executeMergeBuckets(
  userId: string,
  payload: MergeBucketsPayload,
): Promise<string[]> {
  const source = await getBucketById(userId, payload.source_bucket_id)
  if (!source) throw new Error(`Source bucket not found: ${payload.source_bucket_id}`)

  const target = await getBucketById(userId, payload.target_bucket_id)
  if (!target) throw new Error(`Target bucket not found: ${payload.target_bucket_id}`)

  // Move all notes from source to target
  const { error } = await getServiceClient()
    .from('notes')
    .update({ bucket_id: target.id })
    .eq('user_id', userId)
    .eq('bucket_id', source.id)

  if (error) throw new Error(`Failed to move notes: ${error.message}`)

  // Delete the source bucket (handles descendants + unclassifies)
  await deleteBucket(userId, source.id)
  return []
}
