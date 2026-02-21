import { updateNote } from '@second-brain/db'
import type { ReclassifyNotePayload } from '@second-brain/shared'

export async function executeReclassifyNote(
  userId: string,
  payload: ReclassifyNotePayload,
): Promise<void> {
  await updateNote(userId, payload.note_id, { bucket_id: payload.to_bucket_id })
}
