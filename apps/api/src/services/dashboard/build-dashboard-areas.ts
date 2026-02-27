import { countNotesByBucket } from '@second-brain/db'
import type { BucketNoteStats } from '@second-brain/db'
import { collectDescendantIds } from '@second-brain/shared'
import type { DashboardArea, ParaBucket } from '@second-brain/shared'

/**
 * Builds the areas section for the dashboard response.
 * Groups buckets under top-level project/area containers with stats.
 */
export async function buildDashboardAreas(
  userId: string,
  buckets: ParaBucket[],
): Promise<DashboardArea[]> {
  const topLevel = buckets.filter(
    (b) => !b.parent_id && (b.type === 'project' || b.type === 'area'),
  )

  const stats = await countNotesByBucket(userId)
  const areas: DashboardArea[] = []

  for (const container of topLevel) {
    const children = buckets.filter((b) => b.parent_id === container.id)

    for (const child of children) {
      areas.push(buildArea(child, buckets, stats))
    }
  }

  return areas
}

function buildArea(
  bucket: ParaBucket,
  allBuckets: ParaBucket[],
  stats: BucketNoteStats,
): DashboardArea {
  const descendantIds = collectDescendantIds(bucket.id, allBuckets)

  let noteCount = 0
  let lastCaptureAt: string | null = null

  for (const id of descendantIds) {
    noteCount += stats.counts.get(id) ?? 0
    const capture = stats.lastCapture.get(id)
    if (capture && (!lastCaptureAt || capture > lastCaptureAt)) {
      lastCaptureAt = capture
    }
  }

  const subBuckets = allBuckets.filter((b) => b.parent_id === bucket.id)

  return {
    id: bucket.id,
    name: bucket.name,
    type: bucket.type,
    note_count: noteCount,
    last_capture_at: lastCaptureAt,
    health: computeHealth(lastCaptureAt),
    children: subBuckets.map((sb) => ({
      id: sb.id,
      name: sb.name,
      note_count: stats.counts.get(sb.id) ?? 0,
    })),
  }
}

function computeHealth(
  lastCapture: string | null,
): 'growing' | 'stable' | 'stagnant' {
  if (!lastCapture) return 'stagnant'
  const days = (Date.now() - new Date(lastCapture).getTime()) / 86400000
  if (days <= 14) return 'growing'
  if (days <= 28) return 'stable'
  return 'stagnant'
}
