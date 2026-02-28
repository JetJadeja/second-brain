import { Router } from 'express'
import { z } from 'zod'
import {
  classifyNote,
  batchClassify,
  archiveNote,
  deleteNote,
  getBucketById,
  countInboxNotes,
} from '@second-brain/db'
import { getAllBuckets, invalidateParaCache } from '../services/para/para-cache.js'
import { buildUnifiedFeed } from '../services/inbox/build-unified-feed.js'
import { maybeTriggerOverview } from '../services/overview/trigger-overview.js'
import { catchAsync, param } from '../middleware/catch-async.js'
import type { InboxResponse } from '@second-brain/shared'

export const inboxRouter = Router()

const classifySchema = z.object({ bucket_id: z.string().uuid() })

const batchClassifySchema = z.object({
  classifications: z.array(
    z.object({ note_id: z.string().uuid(), bucket_id: z.string().uuid() }),
  ),
})

inboxRouter.get('/', catchAsync(async (req, res) => {
  const userId = req.userId!
  const page = Number(req.query['page']) || 1
  const limit = Number(req.query['limit']) || 20

  const { items, total } = await buildUnifiedFeed(userId, page, limit)

  const response: InboxResponse = { items, total, page, limit }
  res.json(response)
}))

inboxRouter.get('/count', catchAsync(async (req, res) => {
  const userId = req.userId!
  const count = await countInboxNotes(userId)
  res.json({ count })
}))

inboxRouter.post('/:noteId/classify', catchAsync(async (req, res) => {
  const userId = req.userId!
  const noteId = param(req, 'noteId')
  const parsed = classifySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const bucket = await getBucketById(userId, parsed.data.bucket_id)
  if (!bucket) {
    res.status(404).json({ error: 'Bucket not found' })
    return
  }

  await classifyNote(userId, noteId, parsed.data.bucket_id)
  invalidateParaCache(userId)
  void maybeTriggerOverview(userId, parsed.data.bucket_id)
  res.json({ success: true })
}))

inboxRouter.post('/batch-classify', catchAsync(async (req, res) => {
  const userId = req.userId!
  const parsed = batchClassifySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const count = await batchClassify(userId, parsed.data.classifications)
  invalidateParaCache(userId)
  const uniqueBucketIds = [...new Set(parsed.data.classifications.map((c) => c.bucket_id))]
  for (const bid of uniqueBucketIds) void maybeTriggerOverview(userId, bid)
  res.json({ success: true, classified: count })
}))

inboxRouter.delete('/:noteId', catchAsync(async (req, res) => {
  const userId = req.userId!
  await deleteNote(userId, param(req, 'noteId'))
  res.json({ success: true })
}))

inboxRouter.post('/:noteId/archive', catchAsync(async (req, res) => {
  const userId = req.userId!
  const buckets = await getAllBuckets(userId)
  const archive = buckets.find((b) => !b.parent_id && b.type === 'archive')

  if (!archive) {
    res.status(500).json({ error: 'Archive bucket not found' })
    return
  }

  await archiveNote(userId, param(req, 'noteId'), archive.id)
  invalidateParaCache(userId)
  res.json({ success: true })
}))
