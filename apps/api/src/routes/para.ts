import { Router } from 'express'
import { z } from 'zod'
import {
  getBucketById,
  createBucket,
  updateBucket,
  deleteBucket,
  getNotesByBucket,
} from '@second-brain/db'
import {
  getParaTree,
  getBucketPath,
  invalidateParaCache,
  getAllBuckets,
} from '../services/para-tree.js'
import type {
  ParaTreeResponse,
  BucketDetailResponse,
} from '@second-brain/shared'

export const paraRouter = Router()

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

paraRouter.get('/tree', async (req, res) => {
  const userId = req.userId!
  const tree = await getParaTree(userId)
  const response: ParaTreeResponse = { tree }
  res.json(response)
})

paraRouter.get('/:bucketId', async (req, res) => {
  const userId = req.userId!
  const bucketId = req.params['bucketId']!

  const bucket = await getBucketById(userId, bucketId)
  if (!bucket) {
    res.status(404).json({ error: 'Bucket not found' })
    return
  }

  const page = Number(req.query['page']) || 1
  const limit = Number(req.query['limit']) || 20
  const sort = (req.query['sort'] as string) || 'captured_at'
  const sourceType = req.query['filter_source_type'] as string | undefined
  const status = req.query['filter_status'] as string | undefined

  const { data: notes, total } = await getNotesByBucket(userId, bucketId, {
    page,
    limit,
    sort,
    sourceType: sourceType as any,
    status: status as any,
  })

  const path = await getBucketPath(userId, bucketId)
  const allBuckets = await getAllBuckets(userId)
  const children = allBuckets.filter((b) => b.parent_id === bucketId)

  // Count distilled and evergreen
  let distilledCount = 0
  let evergreenCount = 0
  for (const n of notes) {
    if (n.distillation_status === 'distilled') distilledCount++
    if (n.distillation_status === 'evergreen') evergreenCount++
  }

  const response: BucketDetailResponse = {
    bucket: {
      id: bucket.id,
      name: bucket.name,
      type: bucket.type,
      path: path ?? bucket.name,
      note_count: total,
      distilled_count: distilledCount,
      evergreen_count: evergreenCount,
      children: children.map((c) => ({ id: c.id, name: c.name, note_count: 0 })),
    },
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      ai_summary: n.ai_summary,
      distillation: n.distillation,
      source_type: n.source_type,
      source: n.source,
      distillation_status: n.distillation_status,
      captured_at: n.captured_at,
      connection_count: n.connection_count,
      tags: n.tags,
    })),
    total,
    page,
    limit,
  }

  res.json(response)
})

paraRouter.post('/buckets', async (req, res) => {
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

  // Walk up to root to validate type match
  const allBuckets = await getAllBuckets(userId)
  let root = parent
  while (root.parent_id) {
    const p = allBuckets.find((b) => b.id === root.parent_id)
    if (!p) break
    root = p
  }

  if (root.type !== parsed.data.type) {
    res.status(400).json({ error: `Type must match root ancestor type: ${root.type}` })
    return
  }

  const bucket = await createBucket(userId, parsed.data)
  invalidateParaCache(userId)
  res.status(201).json(bucket)
})

paraRouter.patch('/buckets/:bucketId', async (req, res) => {
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

paraRouter.delete('/buckets/:bucketId', async (req, res) => {
  const userId = req.userId!
  const bucketId = req.params['bucketId']!

  const existing = await getBucketById(userId, bucketId)
  if (!existing) {
    res.status(404).json({ error: 'Bucket not found' })
    return
  }

  await deleteBucket(userId, bucketId)
  invalidateParaCache(userId)
  res.json({ success: true })
})
