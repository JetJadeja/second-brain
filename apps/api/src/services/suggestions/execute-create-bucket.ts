import { getAllBuckets, createBucket, classifyNote } from '@second-brain/db'
import type { CreateBucketPayload } from '@second-brain/shared'

export async function executeCreateBucket(
  userId: string,
  payload: CreateBucketPayload,
): Promise<void> {
  const buckets = await getAllBuckets(userId)

  const root = buckets.find(
    (b) => b.type === payload.parent_type && b.parent_id === null,
  )
  if (!root) {
    throw new Error(`No root container for type: ${payload.parent_type}`)
  }

  const existing = buckets.find(
    (b) => b.name.toLowerCase() === payload.bucket_name.toLowerCase() && b.parent_id === root.id,
  )

  const bucketId = existing
    ? existing.id
    : (await createBucket(userId, {
        name: payload.bucket_name,
        type: payload.parent_type,
        parent_id: root.id,
      })).id

  await classifyNote(userId, payload.note_id, bucketId)
}
