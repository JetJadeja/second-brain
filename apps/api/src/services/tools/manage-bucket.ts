import { getAllBuckets, updateBucket, deleteBucket } from '@second-brain/db'
import { invalidateParaCache } from '../para/para-cache.js'
import { reevaluateInbox } from '../processors/reevaluate-inbox.js'
import { findBucketByName } from './find-bucket.js'

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
  const bucket = findBucketByName(buckets, input.bucketName)
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
      const parent = findBucketByName(buckets, input.newParentName)
      if (!parent) throw new Error(`Could not find parent folder "${input.newParentName}"`)
      await updateBucket(userId, bucket.id, { parent_id: parent.id })
      invalidateParaCache(userId)
      return { action: 'move', bucketName: bucket.name, newParent: parent.name }
    }

    case 'delete': {
      await deleteBucket(userId, bucket.id)
      invalidateParaCache(userId)
      void reevaluateInbox(userId, 'delete')
      return { action: 'delete', bucketName: bucket.name }
    }

    default:
      throw new Error(`Unknown action: ${input.action}`)
  }
}
