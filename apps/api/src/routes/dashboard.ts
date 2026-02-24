import { Router } from 'express'
import { getInboxNotes, countInboxNotes } from '@second-brain/db'
import { getRecentlyViewed } from '@second-brain/db'
import { getNoteById, getRecentNotes } from '@second-brain/db'
import { getBucketPath, getAllBuckets } from '../services/para/para-cache.js'
import { buildDashboardAreas } from '../services/build-dashboard-areas.js'
import type {
  DashboardResponse,
  DashboardInboxItem,
  DashboardNote,
} from '@second-brain/shared'

export const dashboardRouter = Router()

dashboardRouter.get('/', async (req, res) => {
  const userId = req.userId!

  const [inboxCount, inboxRecent, recentNotes, recentViews, buckets] =
    await Promise.all([
      countInboxNotes(userId),
      getInboxNotes(userId, { limit: 5 }),
      getRecentNotes(userId, { limit: 15 }),
      getRecentlyViewed(userId, 15),
      getAllBuckets(userId),
    ])

  // Inbox recent items with bucket paths
  const recentInbox: DashboardInboxItem[] = await Promise.all(
    inboxRecent.data.map(async (n) => ({
      id: n.id,
      title: n.title,
      ai_summary: n.ai_summary,
      source_type: n.source_type,
      source: n.source,
      ai_suggested_bucket: n.ai_suggested_bucket,
      ai_suggested_bucket_path: await getBucketPath(userId, n.ai_suggested_bucket),
      captured_at: n.captured_at,
    })),
  )

  // Merge recent captures + recently viewed, dedup
  const seenIds = new Set<string>()
  const merged: DashboardNote[] = []

  for (const n of recentNotes.data) {
    if (seenIds.has(n.id)) continue
    seenIds.add(n.id)
    merged.push({
      id: n.id,
      title: n.title,
      ai_summary: n.ai_summary,
      distillation: n.distillation,
      source_type: n.source_type,
      source: n.source,
      bucket_id: n.bucket_id,
      bucket_path: await getBucketPath(userId, n.bucket_id),
      distillation_status: n.distillation_status,
      captured_at: n.captured_at,
      connection_count: n.connection_count,
    })
  }

  for (const view of recentViews) {
    if (seenIds.has(view.note_id)) continue
    seenIds.add(view.note_id)
    const n = await getNoteById(userId, view.note_id)
    if (!n || !n.is_classified) continue
    merged.push({
      id: n.id,
      title: n.title,
      ai_summary: n.ai_summary,
      distillation: n.distillation,
      source_type: n.source_type,
      source: n.source,
      bucket_id: n.bucket_id,
      bucket_path: await getBucketPath(userId, n.bucket_id),
      distillation_status: n.distillation_status,
      captured_at: n.captured_at,
      connection_count: n.connection_count,
    })
  }

  // Areas: children of top-level Projects and Areas containers
  const areas = await buildDashboardAreas(userId, buckets)

  const response: DashboardResponse = {
    inbox: { count: inboxCount, recent: recentInbox },
    recent_and_relevant: merged.slice(0, 12),
    areas,
  }

  res.json(response)
})
