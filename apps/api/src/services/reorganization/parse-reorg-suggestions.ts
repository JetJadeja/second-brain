import { z } from 'zod'
import { parseLlmJson } from '@second-brain/ai'
import type { SuggestionType } from '@second-brain/shared'

export interface ParsedSuggestion {
  type: SuggestionType
  payload: Record<string, unknown>
}

const mergeBucketsSchema = z.object({
  type: z.literal('merge_buckets'),
  payload: z.object({
    source_bucket_id: z.string(),
    source_name: z.string(),
    target_bucket_id: z.string(),
    target_name: z.string(),
    reason: z.string(),
  }),
})

const renameBucketSchema = z.object({
  type: z.literal('rename_bucket'),
  payload: z.object({ bucket_id: z.string(), old_name: z.string(), new_name: z.string(), reason: z.string() }),
})

const deleteBucketSchema = z.object({
  type: z.literal('delete_bucket'),
  payload: z.object({ bucket_id: z.string(), bucket_name: z.string(), reason: z.string() }),
})

const splitBucketSchema = z.object({
  type: z.literal('split_bucket'),
  payload: z.object({
    bucket_id: z.string(),
    bucket_name: z.string(),
    splits: z.array(z.object({ name: z.string(), note_ids: z.array(z.string()) })),
  }),
})

const archiveProjectSchema = z.object({
  type: z.literal('archive_project'),
  payload: z.object({ bucket_id: z.string(), bucket_name: z.string(), days_inactive: z.number() }),
})

const reclassifyNoteSchema = z.object({
  type: z.literal('reclassify_note'),
  payload: z.object({
    note_id: z.string(), note_title: z.string(),
    from_bucket_id: z.string(), from_path: z.string(),
    to_bucket_id: z.string(), to_path: z.string(), reason: z.string(),
  }),
})

const suggestionSchema = z.discriminatedUnion('type', [
  mergeBucketsSchema, renameBucketSchema, deleteBucketSchema,
  splitBucketSchema, archiveProjectSchema, reclassifyNoteSchema,
])

export function parseReorgSuggestions(text: string): ParsedSuggestion[] {
  try {
    const parsed = parseLlmJson(text)
    if (!Array.isArray(parsed)) return []

    const results: ParsedSuggestion[] = []
    for (const item of parsed) {
      const result = suggestionSchema.safeParse(item)
      if (result.success) {
        results.push({
          type: result.data.type,
          payload: result.data.payload as Record<string, unknown>,
        })
      }
    }
    return results
  } catch {
    console.error('[parse-reorg] Failed to parse suggestions:', text.slice(0, 200))
    return []
  }
}
