import type { Note } from '@second-brain/shared'
import { updateNote, insertDistillationHistory, getBucketById } from '@second-brain/db'

export interface UpdateNoteFields {
  title?: string
  bucket_id?: string
  tags?: string[]
  distillation?: string
  distillation_status?: string
  key_points?: string[]
}

export class BucketNotFoundError extends Error {
  constructor(bucketId: string) {
    super(`Target bucket not found: ${bucketId}`)
    this.name = 'BucketNotFoundError'
  }
}

export async function updateNoteWithHistory(
  userId: string,
  noteId: string,
  fields: UpdateNoteFields,
  existing: Note,
): Promise<Note> {
  if (
    (fields.distillation !== undefined || fields.distillation_status !== undefined) &&
    existing.distillation
  ) {
    await insertDistillationHistory(
      userId,
      noteId,
      existing.distillation,
      existing.distillation_status,
    )
  }

  const updateFields: Record<string, unknown> = { ...fields }
  if (fields.bucket_id) {
    const bucket = await getBucketById(userId, fields.bucket_id)
    if (!bucket) throw new BucketNotFoundError(fields.bucket_id)
    updateFields['is_classified'] = true
  }

  return updateNote(userId, noteId, updateFields)
}
