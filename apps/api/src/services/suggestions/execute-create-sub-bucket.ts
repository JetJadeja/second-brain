import { createBucket, updateNote, getBucketById, getAllBuckets, countNotesByBucket } from '@second-brain/db'
import { collectDescendantIds } from '@second-brain/shared'
import type { CreateSubBucketPayload } from '@second-brain/shared'

const MIN_NOTES_FOR_SUB_BUCKET = 15

export async function executeCreateSubBucket(
  userId: string,
  payload: CreateSubBucketPayload,
): Promise<void> {
  const parent = await getBucketById(userId, payload.parent_bucket_id)
  if (!parent) {
    throw new Error(`Parent bucket not found: ${payload.parent_bucket_id}`)
  }

  const [buckets, noteCounts] = await Promise.all([
    getAllBuckets(userId),
    countNotesByBucket(userId),
  ])
  const totalNotes = collectDescendantIds(parent.id, buckets)
    .reduce((sum, id) => sum + (noteCounts.get(id) ?? 0), 0)

  if (totalNotes < MIN_NOTES_FOR_SUB_BUCKET) {
    throw new Error(
      `Cannot create sub-bucket: "${parent.name}" needs at least ${MIN_NOTES_FOR_SUB_BUCKET} notes (currently has ${totalNotes})`,
    )
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
