import { getServiceClient } from '../client.js'
import type { DistillationStatus } from '@second-brain/shared'

export async function insertDistillationHistory(
  userId: string,
  noteId: string,
  content: string,
  status: DistillationStatus,
): Promise<void> {
  const { error } = await getServiceClient()
    .from('distillation_history')
    .insert({
      user_id: userId,
      note_id: noteId,
      content,
      status,
    })

  if (error) throw new Error(`insertDistillationHistory: ${error.message}`)
}
