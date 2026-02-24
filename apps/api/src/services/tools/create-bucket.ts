import { getAllBuckets, createBucket } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
import { getBucketPath } from '../processors/resolve-bucket-path.js'

export interface CreateBucketResult {
  bucketId: string
  name: string
  type: string
  path: string | null
}

export async function executeCreateBucket(
  userId: string,
  name: string,
  type: 'project' | 'area' | 'resource',
  parentName?: string,
  description?: string,
): Promise<CreateBucketResult> {
  if (!name.trim()) {
    throw new Error('Bucket name cannot be empty')
  }
  if (name.length > 100) {
    throw new Error('Bucket name is too long (max 100 characters)')
  }

  const buckets = await getAllBuckets(userId)
  const parentId = resolveParentId(buckets, type, parentName ?? null)

  if (!parentId) {
    const target = parentName ? `"${parentName}"` : `${type}s container`
    throw new Error(`Could not find ${target}`)
  }

  const created = await createBucket(userId, {
    name: name.trim(),
    type,
    parent_id: parentId,
    ...(description ? { description: description.trim() } : {}),
  })

  const path = await getBucketPath(userId, created.id)
  return { bucketId: created.id, name: created.name, type, path }
}

function resolveParentId(
  buckets: ParaBucket[],
  type: string,
  parentName: string | null,
): string | null {
  if (parentName) {
    const lower = parentName.toLowerCase()
    const match = buckets.find((b) => b.name.toLowerCase() === lower)
    return match?.id ?? null
  }
  const root = buckets.find((b) => b.type === type && b.parent_id === null)
  return root?.id ?? null
}
