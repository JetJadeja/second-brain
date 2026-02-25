import type { NoteSource, DistillationStatus, BucketDetailResponse, ParaBucket } from '@second-brain/shared'
import { collectDescendantIds } from '@second-brain/shared'
import { getNotesByBucket, countNotesByBucket } from '@second-brain/db'
import { getBucketPath, getAllBuckets } from './para-cache.js'

export interface BucketDetailOpts {
  page: number
  limit: number
  sort: string
  sourceType?: NoteSource
  status?: DistillationStatus
}

export async function buildBucketDetail(
  userId: string,
  bucket: ParaBucket,
  opts: BucketDetailOpts,
): Promise<BucketDetailResponse> {
  const [path, allBuckets, noteCounts] = await Promise.all([
    getBucketPath(userId, bucket.id),
    getAllBuckets(userId),
    countNotesByBucket(userId),
  ])

  const descendantIds = collectDescendantIds(bucket.id, allBuckets)
  const { data: notes, total } = await getNotesByBucket(userId, descendantIds, opts)
  const children = allBuckets.filter((b) => b.parent_id === bucket.id)

  let distilledCount = 0
  let evergreenCount = 0
  for (const n of notes) {
    if (n.distillation_status === 'distilled') distilledCount++
    if (n.distillation_status === 'evergreen') evergreenCount++
  }

  return {
    bucket: {
      id: bucket.id,
      name: bucket.name,
      type: bucket.type,
      path: path ?? bucket.name,
      description: bucket.description,
      overview: bucket.overview,
      note_count: total,
      distilled_count: distilledCount,
      evergreen_count: evergreenCount,
      children: children.map((c) => ({
        id: c.id,
        name: c.name,
        note_count: collectDescendantIds(c.id, allBuckets)
          .reduce((sum, id) => sum + (noteCounts.get(id) ?? 0), 0),
      })),
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
    page: opts.page,
    limit: opts.limit,
  }
}
