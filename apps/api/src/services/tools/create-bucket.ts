import { getAllBuckets, createBucket, countNotesByBucket } from '@second-brain/db'
import { collectDescendantIds } from '@second-brain/shared'
import type { ParaBucket } from '@second-brain/shared'
import { getBucketPath } from '../para/para-cache.js'
import { invalidateParaCache } from '../para/para-cache.js'
import { reevaluateInbox } from '../processors/reevaluate-inbox.js'

const MIN_NOTES_FOR_SUB_BUCKET = 15

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
  if (name.length > 40) {
    throw new Error('Bucket name is too long (max 40 characters)')
  }

  const buckets = await getAllBuckets(userId)
  const parentId = resolveParentId(buckets, type, parentName ?? null)

  if (!parentId) {
    const target = parentName ? `"${parentName}"` : `${type}s container`
    throw new Error(`Could not find ${target}`)
  }

  const parent = buckets.find((b) => b.id === parentId)
  if (parent && parent.parent_id !== null) {
    const noteCounts = await countNotesByBucket(userId)
    const totalNotes = collectDescendantIds(parent.id, buckets)
      .reduce((sum, id) => sum + (noteCounts.get(id) ?? 0), 0)
    if (totalNotes < MIN_NOTES_FOR_SUB_BUCKET) {
      throw new Error(
        `Cannot create sub-bucket: "${parent.name}" needs at least ${MIN_NOTES_FOR_SUB_BUCKET} notes (currently has ${totalNotes})`,
      )
    }
  }

  const created = await createBucket(userId, {
    name: name.trim(),
    type,
    parent_id: parentId,
    ...(description ? { description: description.trim() } : {}),
  })

  invalidateParaCache(userId)
  void reevaluateInbox(userId, 'create')
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
