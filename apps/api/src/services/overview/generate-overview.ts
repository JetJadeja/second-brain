import { callClaude } from '@second-brain/ai'
import { getNotesByBucket, updateBucket } from '@second-brain/db'
import { collectDescendantIds } from '@second-brain/shared'
import { getAllBuckets } from '../para/para-cache.js'
import { buildOverviewPrompt } from './build-overview-prompt.js'

const MAX_TOKENS = 256

export async function generateOverview(
  userId: string,
  bucketId: string,
  noteCount: number,
): Promise<void> {
  try {
    const allBuckets = await getAllBuckets(userId)
    const bucket = allBuckets.find((b) => b.id === bucketId)
    if (!bucket) return

    const descendantIds = collectDescendantIds(bucket.id, allBuckets)
    const { data: notes } = await getNotesByBucket(userId, descendantIds, { limit: 40 })

    if (notes.length === 0) return

    const summaries = notes.map((n) => ({
      title: n.title,
      summary: n.ai_summary,
    }))

    const { system, user } = buildOverviewPrompt(bucket.name, summaries)

    const overview = await callClaude({
      system,
      messages: [{ role: 'user', content: user }],
      maxTokens: MAX_TOKENS,
    })

    await updateBucket(userId, bucketId, {
      overview: overview.trim(),
      notes_at_last_overview: noteCount,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[generate-overview] bucketId=${bucketId} failed:`, msg)
  }
}
