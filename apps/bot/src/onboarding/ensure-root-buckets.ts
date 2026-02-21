import { getAllBuckets, getServiceClient } from '@second-brain/db'
import { DEFAULT_PARA_BUCKETS } from '@second-brain/shared'
import type { ParaBucket } from '@second-brain/shared'

/**
 * Ensures the 4 root PARA containers exist for a user.
 * Creates any missing root containers (Projects, Areas, Resources, Archive).
 * Returns the full list of buckets after creation.
 */
export async function ensureRootBuckets(userId: string): Promise<ParaBucket[]> {
  const buckets = await getAllBuckets(userId)

  const existingRoots = new Set(
    buckets
      .filter((b) => b.parent_id === null)
      .map((b) => b.type),
  )

  const missing = DEFAULT_PARA_BUCKETS.filter(
    (b) => !existingRoots.has(b.type),
  )

  if (missing.length === 0) return buckets

  // Root containers have no parent_id — insert directly
  const rows = missing.map((b) => ({
    user_id: userId,
    name: b.name,
    type: b.type,
  }))

  try {
    await getServiceClient().from('para_buckets').insert(rows)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[ensureRootBuckets] Failed to create root buckets:', msg)
  }

  return await getAllBuckets(userId)
}
