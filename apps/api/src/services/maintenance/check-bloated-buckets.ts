import { callClaude, buildAnalyzeBucketPrompt, parseLlmJson } from '@second-brain/ai'
import {
  getAllBuckets,
  countNotesByBucket,
  getNotesByBucket,
  createSuggestion,
  hasPendingSuggestion,
} from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'

const BLOAT_THRESHOLD = 15

export async function checkBloatedBuckets(userId: string): Promise<number> {
  const buckets = await getAllBuckets(userId)
  const noteCounts = await countNotesByBucket(userId)
  const leafBuckets = findLeafBuckets(buckets)

  let suggestionsCreated = 0

  for (const bucket of leafBuckets) {
    const count = noteCounts.get(bucket.id) ?? 0
    if (count < BLOAT_THRESHOLD) continue

    const alreadyExists = await hasPendingSuggestion(userId, 'split_bucket', 'bucket_id', bucket.id)
    if (alreadyExists) continue

    const created = await analyzeBucketForSplit(userId, bucket, count)
    if (created) suggestionsCreated++
  }

  return suggestionsCreated
}

function findLeafBuckets(buckets: ParaBucket[]): ParaBucket[] {
  const parentIds = new Set(buckets.map((b) => b.parent_id).filter(Boolean))
  return buckets.filter((b) => !parentIds.has(b.id) && b.parent_id !== null)
}

async function analyzeBucketForSplit(
  userId: string,
  bucket: ParaBucket,
  noteCount: number,
): Promise<boolean> {
  try {
    const { data: notes } = await getNotesByBucket(userId, bucket.id, { limit: noteCount })

    const prompt = buildAnalyzeBucketPrompt({
      bucketName: bucket.name,
      bucketType: bucket.type,
      notes: notes.map((n) => ({ title: n.title, summary: n.ai_summary ?? null })),
    })

    const response = await callClaude({ messages: [{ role: 'user', content: prompt }] })
    const result = parseSplitResponse(response, notes.map((n) => n.id))
    if (!result) return false

    await createSuggestion(userId, 'split_bucket', {
      bucket_id: bucket.id,
      bucket_name: bucket.name,
      splits: result,
    })

    return true
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[checkBloatedBuckets] bucket=${bucket.id}:`, msg)
    return false
  }
}

function parseSplitResponse(
  text: string,
  noteIds: string[],
): Array<{ name: string; note_ids: string[] }> | null {
  try {
    const parsed = parseLlmJson(text)
    if (!parsed || !parsed['should_split']) return null
    if (!Array.isArray(parsed['splits'])) return null

    return (parsed['splits'] as Array<Record<string, unknown>>).map((split) => ({
      name: String(split['name'] ?? ''),
      note_ids: (split['note_indices'] as number[])
        .map((i) => noteIds[i])
        .filter((id): id is string => id !== undefined),
    }))
  } catch {
    console.error('[checkBloatedBuckets] Failed to parse LLM response:', text.slice(0, 200))
    return null
  }
}
