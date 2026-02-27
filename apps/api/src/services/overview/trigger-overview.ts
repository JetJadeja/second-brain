import { countNotesByBucket } from '@second-brain/db'
import { collectDescendantIds } from '@second-brain/shared'
import { getAllBuckets } from '../para/para-cache.js'
import { generateOverview } from './generate-overview.js'

const FIRST_THRESHOLD = 5
const SECOND_THRESHOLD = 10
const GROWTH_FACTOR = 1.3

export async function maybeTriggerOverview(
  userId: string,
  bucketId: string,
): Promise<void> {
  try {
    const allBuckets = await getAllBuckets(userId)
    const bucket = allBuckets.find((b) => b.id === bucketId)
    if (!bucket || bucket.parent_id === null) return

    const stats = await countNotesByBucket(userId)
    const descendantIds = collectDescendantIds(bucket.id, allBuckets)
    const currentCount = descendantIds.reduce(
      (sum, id) => sum + (stats.counts.get(id) ?? 0),
      0,
    )

    const threshold = computeNextThreshold(bucket.notes_at_last_overview)
    if (currentCount < threshold) return

    // Fire-and-forget — generate overview asynchronously
    generateOverview(userId, bucketId, currentCount).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[trigger-overview] generation failed:`, msg)
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[trigger-overview] check failed:`, msg)
  }
}

function computeNextThreshold(notesAtLast: number): number {
  if (notesAtLast === 0) return FIRST_THRESHOLD
  if (notesAtLast < SECOND_THRESHOLD) return SECOND_THRESHOLD
  return Math.ceil(notesAtLast * GROWTH_FACTOR)
}
