import { createBucket, updateNote, getBucketById } from '@second-brain/db'
import type { SplitBucketPayload } from '@second-brain/shared'

export async function executeSplitBucket(
  userId: string,
  payload: SplitBucketPayload,
): Promise<string[]> {
  const parent = await getBucketById(userId, payload.bucket_id)
  if (!parent) {
    throw new Error(`Bucket not found: ${payload.bucket_id}`)
  }

  for (const split of payload.splits) {
    const subBucket = await createBucket(userId, {
      name: split.name,
      type: parent.type,
      parent_id: parent.id,
    })

    for (const noteId of split.note_ids) {
      await updateNote(userId, noteId, { bucket_id: subBucket.id })
    }
  }
  return payload.splits.flatMap((s) => s.note_ids)
}
