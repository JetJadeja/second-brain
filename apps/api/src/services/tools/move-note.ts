import { getNoteById, updateNote, getAllBuckets } from '@second-brain/db'
import { getBucketPath } from '../para/para-cache.js'
import { invalidateParaCache } from '../para/para-cache.js'
import { findBucketByName } from './find-bucket.js'

export interface MoveNoteResult {
  noteTitle: string
  targetPath: string | null
}

export async function executeMoveNote(
  userId: string,
  noteId: string,
  targetPath: string,
): Promise<MoveNoteResult> {
  const note = await getNoteById(userId, noteId)
  if (!note) {
    throw new Error(`Could not find note with ID ${noteId}`)
  }

  const buckets = await getAllBuckets(userId)
  const targetBucket = findBucketByName(buckets, targetPath)

  if (!targetBucket) {
    throw new Error(`Could not find a folder matching "${targetPath}"`)
  }

  await updateNote(userId, noteId, {
    bucket_id: targetBucket.id,
    is_classified: true,
  })

  invalidateParaCache(userId)
  const resolvedPath = await getBucketPath(userId, targetBucket.id)
  return { noteTitle: note.title, targetPath: resolvedPath }
}
