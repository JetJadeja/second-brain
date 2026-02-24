import { Router } from 'express'
import { z } from 'zod'
import { getBucketById, createBucket, updateBucket, deleteBucket } from '@second-brain/db'
import { invalidateParaCache, getAllBuckets } from '../services/para/para-cache.js'
import { validateBucketType, TypeMismatchError } from '../services/para/validate-bucket-hierarchy.js'
import { reevaluateInbox } from '../services/processors/reevaluate-inbox.js'

export const paraBucketsRouter = Router()

const createBucketSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['project', 'area', 'resource', 'archive']),
  parent_id: z.string().uuid(),
  description: z.string().optional(),
})

const updateBucketSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  parent_id: z.string().uuid().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
})

paraBucketsRouter.post('/buckets', async (req, res) => {
  const userId = req.userId!
  const parsed = createBucketSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const parent = await getBucketById(userId, parsed.data.parent_id)
  if (!parent) {
    res.status(404).json({ error: 'Parent bucket not found' })
    return
  }

  try {
    const allBuckets = await getAllBuckets(userId)
    validateBucketType(allBuckets, parsed.data.parent_id, parsed.data.type)
  } catch (err) {
    if (err instanceof TypeMismatchError) {
      res.status(400).json({ error: err.message })
      return
    }
    throw err
  }

  const bucket = await createBucket(userId, parsed.data)
  invalidateParaCache(userId)
  void reevaluateInbox(userId, 'create')
  res.status(201).json(bucket)
})

paraBucketsRouter.patch('/buckets/:bucketId', async (req, res) => {
  const userId = req.userId!
  const bucketId = req.params['bucketId']!
  const parsed = updateBucketSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const existing = await getBucketById(userId, bucketId)
  if (!existing) {
    res.status(404).json({ error: 'Bucket not found' })
    return
  }

  const updated = await updateBucket(userId, bucketId, parsed.data)
  invalidateParaCache(userId)
  res.json(updated)
})

paraBucketsRouter.delete('/buckets/:bucketId', async (req, res) => {
  const userId = req.userId!
  const bucketId = req.params['bucketId']!

  const existing = await getBucketById(userId, bucketId)
  if (!existing) {
    res.status(404).json({ error: 'Bucket not found' })
    return
  }

  await deleteBucket(userId, bucketId)
  invalidateParaCache(userId)
  void reevaluateInbox(userId, 'delete')
  res.json({ success: true })
})
