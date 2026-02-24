import { Router } from 'express'
import { getInboxNotes, countInboxNotes } from '@second-brain/db'
import { getRecentlyViewed } from '@second-brain/db'
import { getNoteById, getRecentNotes } from '@second-brain/db'
import { getParaTree, getBucketPath, getAllBuckets } from '../services/para-tree.js'
import { collectDescendantIds } from '@second-brain/shared'
import type {
  DashboardResponse,
  DashboardInboxItem,
  DashboardNote,
  DashboardArea,
  ParaBucket,
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
  const areas = await buildAreas(userId, buckets)

  const response: DashboardResponse = {
    inbox: { count: inboxCount, recent: recentInbox },
    recent_and_relevant: merged.slice(0, 12),
    areas,
  }

  res.json(response)
})

async function buildAreas(
  userId: string,
  buckets: ParaBucket[],
): Promise<DashboardArea[]> {
  const topLevel = buckets.filter(
    (b) => !b.parent_id && (b.type === 'project' || b.type === 'area'),
  )

  const { getServiceClient } = await import('@second-brain/db')
  const sb = getServiceClient()

  const areas: DashboardArea[] = []
  for (const container of topLevel) {
    const children = buckets.filter((b) => b.parent_id === container.id)

    for (const child of children) {
      const descendants = collectDescendantIds(child.id, buckets, false)
      const allIds = [child.id, ...descendants]

      let noteCount = 0
      let lastCapture: string | null = null

      for (const bid of allIds) {
        const { count } = await sb
          .from('notes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('bucket_id', bid)
        noteCount += count ?? 0

        const { data: latest } = await sb
          .from('notes')
          .select('captured_at')
          .eq('user_id', userId)
          .eq('bucket_id', bid)
          .order('captured_at', { ascending: false })
          .limit(1)

        if (latest?.[0]) {
          const cap = latest[0].captured_at as string
          if (!lastCapture || cap > lastCapture) lastCapture = cap
        }
      }

      const health = computeHealth(lastCapture)
      const subBuckets = buckets.filter((b) => b.parent_id === child.id)

      areas.push({
        id: child.id,
        name: child.name,
        type: child.type,
        note_count: noteCount,
        last_capture_at: lastCapture,
        health,
        children: subBuckets.map((sb) => ({
          id: sb.id,
          name: sb.name,
          note_count: 0,
        })),
      })
    }
  }

  return areas
}

function computeHealth(
  lastCapture: string | null,
): 'growing' | 'stable' | 'stagnant' {
  if (!lastCapture) return 'stagnant'
  const days = (Date.now() - new Date(lastCapture).getTime()) / 86400000
  if (days <= 14) return 'growing'
  if (days <= 28) return 'stable'
  return 'stagnant'
}

