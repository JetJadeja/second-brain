import { getAllBuckets, updateBucket, deleteBucket } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
import { invalidateParaCache } from '../para-tree.js'

interface ManageBucketInput {
  action: 'rename' | 'move' | 'delete'
  bucketName: string
  newName?: string
  newParentName?: string
}

export interface ManageBucketResult {
  action: string
  bucketName: string
  newName?: string
  newParent?: string
  noteCount?: number
}

export async function executeManageBucket(
  userId: string,
  input: ManageBucketInput,
): Promise<ManageBucketResult> {
  const buckets = await getAllBuckets(userId)
  const bucket = findBucket(buckets, input.bucketName)
  if (!bucket) {
    throw new Error(`Could not find a folder matching "${input.bucketName}"`)
  }

  switch (input.action) {
    case 'rename': {
      if (!input.newName) throw new Error('new_name is required for rename')
      await updateBucket(userId, bucket.id, { name: input.newName })
      invalidateParaCache(userId)
      return { action: 'rename', bucketName: bucket.name, newName: input.newName }
    }

    case 'move': {
      if (!input.newParentName) throw new Error('new_parent_name is required for move')
      const parent = findBucket(buckets, input.newParentName)
      if (!parent) throw new Error(`Could not find parent folder "${input.newParentName}"`)
      await updateBucket(userId, bucket.id, { parent_id: parent.id })
      invalidateParaCache(userId)
      return { action: 'move', bucketName: bucket.name, newParent: parent.name }
    }

    case 'delete': {
      await deleteBucket(userId, bucket.id)
      invalidateParaCache(userId)
      return { action: 'delete', bucketName: bucket.name }
    }

    default:
      throw new Error(`Unknown action: ${input.action}`)
  }
}

function findBucket(buckets: ParaBucket[], name: string): ParaBucket | null {
  const lower = name.toLowerCase().trim()
  const segments = lower.split(/\s*>\s*/).map((s) => s.trim())
  const lastName = segments[segments.length - 1]
  if (!lastName) return null

  const matches = buckets.filter((b) => b.name.toLowerCase() === lastName)
  return matches[0] ?? null
}
