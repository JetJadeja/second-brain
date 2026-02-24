import { z } from 'zod'
import type { Suggestion } from '@second-brain/shared'
import { executeSplitBucket } from './execute-split.js'
import { executeArchiveProject } from './execute-archive.js'
import { executeReclassifyNote } from './execute-reclassify.js'
import { executeCreateSubBucket } from './execute-create-sub-bucket.js'
import { executeCreateBucket } from './execute-create-bucket.js'

const splitBucketSchema = z.object({
  bucket_id: z.string(),
  bucket_name: z.string(),
  splits: z.array(z.object({ name: z.string(), note_ids: z.array(z.string()) })),
})

const archiveProjectSchema = z.object({
  bucket_id: z.string(),
  bucket_name: z.string(),
  days_inactive: z.number(),
})

const reclassifyNoteSchema = z.object({
  note_id: z.string(),
  note_title: z.string(),
  from_bucket_id: z.string(),
  from_path: z.string(),
  to_bucket_id: z.string(),
  to_path: z.string(),
  reason: z.string(),
})

const createSubBucketSchema = z.object({
  parent_bucket_id: z.string(),
  parent_name: z.string(),
  new_name: z.string(),
  note_ids: z.array(z.string()),
})

const createBucketSchema = z.object({
  note_id: z.string(),
  note_title: z.string(),
  bucket_name: z.string(),
  parent_type: z.enum(['project', 'area', 'resource']),
})

export async function executeSuggestion(
  userId: string,
  suggestion: Suggestion,
): Promise<void> {
  switch (suggestion.type) {
    case 'split_bucket':
      return executeSplitBucket(userId, splitBucketSchema.parse(suggestion.payload))
    case 'archive_project':
      return executeArchiveProject(userId, archiveProjectSchema.parse(suggestion.payload))
    case 'reclassify_note':
      return executeReclassifyNote(userId, reclassifyNoteSchema.parse(suggestion.payload))
    case 'create_sub_bucket':
      return executeCreateSubBucket(userId, createSubBucketSchema.parse(suggestion.payload))
    case 'create_bucket':
      return executeCreateBucket(userId, createBucketSchema.parse(suggestion.payload))
    default:
      throw new Error(`Unknown suggestion type: ${suggestion.type}`)
  }
}
