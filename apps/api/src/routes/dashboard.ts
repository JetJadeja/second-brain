import { Router } from 'express'
import { getInboxNotes, countInboxNotes, countUnannotatedNotes, getRecentNotes, getRecentlyViewed, getPendingSuggestions } from '@second-brain/db'
import { getAllBuckets } from '../services/para/para-cache.js'
import { buildDashboardAreas } from '../services/dashboard/build-dashboard-areas.js'
import { buildDashboardInbox, buildDashboardRecent } from '../services/dashboard/build-dashboard-content.js'
import { catchAsync } from '../middleware/catch-async.js'
import type { DashboardResponse } from '@second-brain/shared'

export const dashboardRouter = Router()

dashboardRouter.get('/', catchAsync(async (req, res) => {
  const userId = req.userId!

  const [noteCount, suggestions, inboxRecent, recentNotes, recentViews, buckets, unannotatedCount] =
    await Promise.all([
      countInboxNotes(userId),
      getPendingSuggestions(userId),
      getInboxNotes(userId, { limit: 5 }),
      getRecentNotes(userId, { limit: 15 }),
      getRecentlyViewed(userId, 15),
      getAllBuckets(userId),
      countUnannotatedNotes(userId),
    ])

  const inboxCount = noteCount + suggestions.length

  const [recentInbox, merged, areas] = await Promise.all([
    buildDashboardInbox(userId, inboxRecent.data),
    buildDashboardRecent(userId, recentNotes.data, recentViews),
    buildDashboardAreas(userId, buckets),
  ])

  const response: DashboardResponse = {
    inbox: { count: inboxCount, recent: recentInbox },
    recent_and_relevant: merged.slice(0, 12),
    areas,
    unannotated_count: unannotatedCount,
  }

  res.json(response)
}))
