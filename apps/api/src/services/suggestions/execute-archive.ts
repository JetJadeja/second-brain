import { updateBucket } from '@second-brain/db'
import type { ArchiveProjectPayload } from '@second-brain/shared'

export async function executeArchiveProject(
  userId: string,
  payload: ArchiveProjectPayload,
): Promise<string[]> {
  await updateBucket(userId, payload.bucket_id, { type: 'archive' })
  return []
}
