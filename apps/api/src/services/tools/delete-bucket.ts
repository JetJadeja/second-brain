import { getAllBuckets, deleteBucket, countNotesByBucket } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'

export interface DeleteBucketResult {
  name: string
  notesMovedToInbox: number
}

export async function executeDeleteBucket(
  userId: string,
  bucketName: string,
): Promise<DeleteBucketResult> {
  const buckets = await getAllBuckets(userId)
  const target = findBucketByName(buckets, bucketName)

  if (!target) {
    throw new Error(`Could not find a folder called "${bucketName}"`)
  }
  if (!target.parent_id) {
    throw new Error('Cannot delete root containers (Projects, Areas, Resources)')
  }

  const noteCount = await countAffectedNotes(userId, target.id, buckets)
  await deleteBucket(userId, target.id)

  return { name: target.name, notesMovedToInbox: noteCount }
}

async function countAffectedNotes(
  userId: string,
  bucketId: string,
  buckets: ParaBucket[],
): Promise<number> {
  const descendantIds = collectDescendantIds(bucketId, buckets)
  const stats = await countNotesByBucket(userId)

  let total = 0
  for (const id of descendantIds) {
    total += stats.counts.get(id) ?? 0
  }
  return total
}

function collectDescendantIds(rootId: string, buckets: ParaBucket[]): string[] {
  const ids = [rootId]
  const queue = [rootId]

  while (queue.length > 0) {
    const parentId = queue.shift()!
    for (const b of buckets) {
      if (b.parent_id === parentId) {
        ids.push(b.id)
        queue.push(b.id)
      }
    }
  }
  return ids
}

function findBucketByName(buckets: ParaBucket[], name: string): ParaBucket | null {
  const lower = name.toLowerCase().trim()
  return buckets.find((b) => b.name.toLowerCase() === lower) ?? null
}
