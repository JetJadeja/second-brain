import { getAllBuckets, createBucket } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
import type { BucketToCreate } from './parse-onboarding-response.js'

/**
 * Creates buckets from the onboarding LLM response.
 * Skips duplicates. Logs errors but never throws.
 * Returns the names of successfully created buckets.
 */
export async function createOnboardingBuckets(
  userId: string,
  bucketsToCreate: BucketToCreate[],
): Promise<string[]> {
  if (bucketsToCreate.length === 0) return []

  const existing = await getAllBuckets(userId)
  const created: string[] = []

  for (const bucket of bucketsToCreate) {
    const parentId = resolveParent(existing, bucket)
    if (!parentId) {
      console.error(`[createOnboardingBuckets] No parent found for ${bucket.name} (type: ${bucket.type})`)
      continue
    }

    if (isDuplicate(existing, bucket.name, parentId)) continue

    try {
      const result = await createBucket(userId, {
        name: bucket.name,
        type: bucket.type,
        parent_id: parentId,
      })
      existing.push(result)
      created.push(bucket.name)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[createOnboardingBuckets] Failed to create ${bucket.name}:`, msg)
    }
  }

  return created
}

function resolveParent(buckets: ParaBucket[], bucket: BucketToCreate): string | null {
  if (bucket.parentName) {
    const parent = buckets.find(
      (b) => b.name.toLowerCase() === bucket.parentName!.toLowerCase(),
    )
    return parent?.id ?? null
  }

  // Find root container matching the bucket type
  const root = buckets.find((b) => b.type === bucket.type && b.parent_id === null)
  return root?.id ?? null
}

function isDuplicate(buckets: ParaBucket[], name: string, parentId: string): boolean {
  return buckets.some(
    (b) => b.name.toLowerCase() === name.toLowerCase() && b.parent_id === parentId,
  )
}
