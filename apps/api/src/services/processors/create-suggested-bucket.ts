import { getAllBuckets, createBucket } from '@second-brain/db'
import type { SuggestNewBucket } from '@second-brain/shared'

/**
 * Creates a bucket from a classification suggestion.
 * Finds the root container matching the parent_type,
 * skips if a bucket with the same name already exists,
 * and returns the new (or existing) bucket ID.
 *
 * Returns null on failure. Never throws.
 */
export async function createSuggestedBucket(
  userId: string,
  suggestion: SuggestNewBucket,
): Promise<string | null> {
  try {
    const buckets = await getAllBuckets(userId)

    const root = buckets.find(
      (b) => b.type === suggestion.parent_type && b.parent_id === null,
    )
    if (!root) {
      console.error(`[createSuggestedBucket] No root container for type: ${suggestion.parent_type}`)
      return null
    }

    // Check if bucket with same name already exists under this root
    const existing = buckets.find(
      (b) => b.name.toLowerCase() === suggestion.name.toLowerCase() && b.parent_id === root.id,
    )
    if (existing) return existing.id

    const created = await createBucket(userId, {
      name: suggestion.name,
      type: suggestion.parent_type,
      parent_id: root.id,
    })

    return created.id
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[createSuggestedBucket] Failed to create "${suggestion.name}":`, msg)
    return null
  }
}
