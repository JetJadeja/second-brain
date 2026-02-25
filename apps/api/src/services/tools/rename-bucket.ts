import { getAllBuckets, updateBucket } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
import { getBucketPath } from '../para/para-cache.js'

export interface RenameBucketResult {
  oldName: string
  newName: string
  path: string | null
}

export async function executeRenameBucket(
  userId: string,
  currentName: string,
  newName: string,
  newDescription?: string,
): Promise<RenameBucketResult> {
  if (!newName.trim()) {
    throw new Error('New name cannot be empty')
  }
  if (newName.length > 100) {
    throw new Error('New name is too long (max 100 characters)')
  }

  const buckets = await getAllBuckets(userId)
  const target = findBucketByName(buckets, currentName)

  if (!target) {
    throw new Error(`Could not find a folder called "${currentName}"`)
  }
  if (!target.parent_id) {
    throw new Error('Cannot rename root containers (Projects, Areas, Resources)')
  }

  const fields: Partial<ParaBucket> = { name: newName.trim() }
  if (newDescription !== undefined) {
    fields.description = newDescription.trim()
  }

  await updateBucket(userId, target.id, fields)
  const path = await getBucketPath(userId, target.id)

  return { oldName: target.name, newName: newName.trim(), path }
}

function findBucketByName(buckets: ParaBucket[], name: string): ParaBucket | null {
  const lower = name.toLowerCase().trim()
  return buckets.find((b) => b.name.toLowerCase() === lower) ?? null
}
