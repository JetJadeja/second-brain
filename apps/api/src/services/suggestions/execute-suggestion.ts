import type {
  Suggestion,
  SplitBucketPayload,
  ArchiveProjectPayload,
  ReclassifyNotePayload,
  CreateSubBucketPayload,
} from '@second-brain/shared'
import { executeSplitBucket } from './execute-split.js'
import { executeArchiveProject } from './execute-archive.js'
import { executeReclassifyNote } from './execute-reclassify.js'
import { executeCreateSubBucket } from './execute-create-sub-bucket.js'

export async function executeSuggestion(
  userId: string,
  suggestion: Suggestion,
): Promise<void> {
  const payload = suggestion.payload as Record<string, unknown>

  switch (suggestion.type) {
    case 'split_bucket':
      return executeSplitBucket(userId, payload as unknown as SplitBucketPayload)
    case 'archive_project':
      return executeArchiveProject(userId, payload as unknown as ArchiveProjectPayload)
    case 'reclassify_note':
      return executeReclassifyNote(userId, payload as unknown as ReclassifyNotePayload)
    case 'create_sub_bucket':
      return executeCreateSubBucket(userId, payload as unknown as CreateSubBucketPayload)
    default:
      throw new Error(`Unknown suggestion type: ${suggestion.type}`)
  }
}
