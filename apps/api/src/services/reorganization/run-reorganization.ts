import { runAgentLoop } from '@second-brain/ai'
import {
  getAllBuckets,
  countNotesByBucket,
  getSampleNoteTitles,
  getBucketStats,
  createSuggestion,
  hasPendingSuggestion,
} from '@second-brain/db'
import { buildReorgSystemPrompt } from './reorg-system-prompt.js'
import { REORG_TOOLS } from './reorg-tools.js'
import { executeReorgTool } from './handle-reorg-tools.js'
import { parseReorgSuggestions } from './parse-reorg-suggestions.js'

export async function runReorganization(userId: string): Promise<number> {
  const snapshot = await buildSnapshot(userId)
  if (snapshot.length === 0) return 0

  const system = buildReorgSystemPrompt(snapshot)

  const result = await runAgentLoop({
    system,
    messages: [{ role: 'user', content: 'Analyze my knowledge base and suggest improvements.' }],
    tools: REORG_TOOLS,
    toolExecutor: (name, input) => executeReorgTool(name, input, userId),
    maxTurns: 5,
  })

  const suggestions = parseReorgSuggestions(result.text)
  let created = 0

  for (const s of suggestions) {
    const key = findDeduplicationKey(s.type, s.payload)
    if (key) {
      const exists = await hasPendingSuggestion(userId, s.type, key.field, key.value)
      if (exists) continue
    }
    await createSuggestion(userId, s.type, s.payload)
    created++
  }

  if (created > 0) {
    console.log(`[reorganization] userId=${userId}: created ${created} suggestions`)
  }

  return created
}

async function buildSnapshot(userId: string) {
  const [buckets, noteStats, sampleTitles] = await Promise.all([
    getAllBuckets(userId),
    countNotesByBucket(userId),
    getSampleNoteTitles(userId),
  ])

  const results = buckets
    .filter((b) => b.parent_id !== null)
    .map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      parent_id: b.parent_id,
      note_count: noteStats.counts.get(b.id) ?? 0,
      sample_titles: sampleTitles.get(b.id) ?? [],
      last_capture_at: noteStats.lastCapture.get(b.id) ?? null,
    }))

  return results
}

function findDeduplicationKey(
  type: string,
  payload: Record<string, unknown>,
): { field: string; value: string } | null {
  switch (type) {
    case 'merge_buckets':
      return { field: 'source_bucket_id', value: payload['source_bucket_id'] as string }
    case 'rename_bucket':
    case 'delete_bucket':
      return { field: 'bucket_id', value: payload['bucket_id'] as string }
    case 'split_bucket':
    case 'archive_project':
      return { field: 'bucket_id', value: payload['bucket_id'] as string }
    case 'reclassify_note':
      return { field: 'note_id', value: payload['note_id'] as string }
    default:
      return null
  }
}
