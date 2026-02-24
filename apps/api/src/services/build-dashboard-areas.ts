import { getBucketStats } from '@second-brain/db'
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

  const areas: DashboardArea[] = []

  for (const container of topLevel) {
    const children = buckets.filter((b) => b.parent_id === container.id)

    for (const child of children) {
      const area = await buildArea(userId, child, buckets)
      areas.push(area)
    }
  }

  return areas
}

async function buildArea(
  userId: string,
  bucket: ParaBucket,
  allBuckets: ParaBucket[],
): Promise<DashboardArea> {
  const descendantIds = collectDescendantIds(bucket.id, allBuckets)
  const stats = await getBucketStats(userId, descendantIds)
  const subBuckets = allBuckets.filter((b) => b.parent_id === bucket.id)

  return {
    id: bucket.id,
    name: bucket.name,
    type: bucket.type,
    note_count: stats.noteCount,
    last_capture_at: stats.lastCaptureAt,
    health: computeHealth(stats.lastCaptureAt),
    children: subBuckets.map((sb) => ({
      id: sb.id,
      name: sb.name,
      note_count: 0,
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
