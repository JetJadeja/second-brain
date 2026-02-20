import { getServiceClient } from '../client.js'
import type { ParaBucket } from '@second-brain/shared'

export async function getAllBuckets(userId: string): Promise<ParaBucket[]> {
  const { data, error } = await getServiceClient()
    .from('para_buckets')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')

  if (error) throw new Error(`getAllBuckets: ${error.message}`)
  return (data ?? []) as ParaBucket[]
}

export async function getBucketById(
  userId: string,
  bucketId: string,
): Promise<ParaBucket | null> {
  const { data, error } = await getServiceClient()
    .from('para_buckets')
    .select('*')
    .eq('id', bucketId)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as ParaBucket
}

export async function createBucket(
  userId: string,
  input: { name: string; type: string; parent_id: string; description?: string },
): Promise<ParaBucket> {
  const { data, error } = await getServiceClient()
    .from('para_buckets')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) throw new Error(`createBucket: ${error.message}`)
  return data as ParaBucket
}

export async function updateBucket(
  userId: string,
  bucketId: string,
  fields: Partial<ParaBucket>,
): Promise<ParaBucket> {
  const { data, error } = await getServiceClient()
    .from('para_buckets')
    .update(fields)
    .eq('id', bucketId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(`updateBucket: ${error.message}`)
  return data as ParaBucket
}

export async function deleteBucket(
  userId: string,
  bucketId: string,
): Promise<void> {
  const sb = getServiceClient()

  // Collect this bucket + all descendants
  const allBuckets = await getAllBuckets(userId)
  const toDelete = collectDescendants(bucketId, allBuckets)

  // Unclassify notes in all affected buckets
  for (const bid of toDelete) {
    await sb
      .from('notes')
      .update({ bucket_id: null, is_classified: false })
      .eq('user_id', userId)
      .eq('bucket_id', bid)
  }

  // Delete the root bucket (cascade handles children)
  const { error } = await sb
    .from('para_buckets')
    .delete()
    .eq('id', bucketId)
    .eq('user_id', userId)

  if (error) throw new Error(`deleteBucket: ${error.message}`)
}

function collectDescendants(
  rootId: string,
  buckets: ParaBucket[],
): string[] {
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

export async function countUserBuckets(userId: string): Promise<number> {
  const { count, error } = await getServiceClient()
    .from('para_buckets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`countUserBuckets: ${error.message}`)
  return count ?? 0
}
