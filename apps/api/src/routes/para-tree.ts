import { Router } from 'express'
import { z } from 'zod'
import { getBucketById } from '@second-brain/db'
import { getParaTree } from '../services/para/para-cache.js'
import { buildBucketDetail } from '../services/para/build-bucket-detail.js'
import { NOTE_SOURCES, DISTILLATION_STATUSES } from '@second-brain/shared'
import { catchAsync, param } from '../middleware/catch-async.js'
import type { ParaTreeResponse } from '@second-brain/shared'

export const paraTreeRouter = Router()

paraTreeRouter.get('/tree', catchAsync(async (req, res) => {
  const userId = req.userId!
  const tree = await getParaTree(userId)
  const response: ParaTreeResponse = { tree }
  res.json(response)
}))

paraTreeRouter.get('/:bucketId', catchAsync(async (req, res) => {
  const userId = req.userId!
  const bucketId = param(req, 'bucketId')

  const bucket = await getBucketById(userId, bucketId)
  if (!bucket) {
    res.status(404).json({ error: 'Bucket not found' })
    return
  }

  const sourceTypeParsed = z.enum(NOTE_SOURCES).safeParse(req.query['filter_source_type'])
  const statusParsed = z.enum(DISTILLATION_STATUSES).safeParse(req.query['filter_status'])

  const response = await buildBucketDetail(userId, bucket, {
    page: Number(req.query['page']) || 1,
    limit: Number(req.query['limit']) || 20,
    sort: (req.query['sort'] as string) || 'captured_at',
    sourceType: sourceTypeParsed.success ? sourceTypeParsed.data : undefined,
    status: statusParsed.success ? statusParsed.data : undefined,
  })

  res.json(response)
}))
