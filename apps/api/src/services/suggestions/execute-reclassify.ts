import { updateNote } from '@second-brain/db'
import type { ReclassifyNotePayload } from '@second-brain/shared'

export async function executeReclassifyNote(
  userId: string,
  payload: ReclassifyNotePayload,
): Promise<string[]> {
  await updateNote(userId, payload.note_id, { bucket_id: payload.to_bucket_id })
  return [payload.note_id]
}
