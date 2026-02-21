import { createBucket, updateNote, getBucketById } from '@second-brain/db'
import type { CreateSubBucketPayload } from '@second-brain/shared'

export async function executeCreateSubBucket(
  userId: string,
  payload: CreateSubBucketPayload,
): Promise<void> {
  const parent = await getBucketById(userId, payload.parent_bucket_id)
  if (!parent) {
    throw new Error(`Parent bucket not found: ${payload.parent_bucket_id}`)
  }

  const subBucket = await createBucket(userId, {
    name: payload.new_name,
    type: parent.type,
    parent_id: parent.id,
  })

  for (const noteId of payload.note_ids) {
    await updateNote(userId, noteId, { bucket_id: subBucket.id })
  }
}
