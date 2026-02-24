import { Router } from 'express'
import { getInboxNotes, countInboxNotes, getRecentNotes, getRecentlyViewed } from '@second-brain/db'
import { getAllBuckets } from '../services/para/para-cache.js'
import { buildDashboardAreas } from '../services/dashboard/build-dashboard-areas.js'
import { buildDashboardInbox, buildDashboardRecent } from '../services/dashboard/build-dashboard-content.js'
import type { DashboardResponse } from '@second-brain/shared'

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

  const recentInbox = await buildDashboardInbox(userId, inboxRecent.data)
  const merged = await buildDashboardRecent(userId, recentNotes.data, recentViews)
  const areas = await buildDashboardAreas(userId, buckets)

  const response: DashboardResponse = {
    inbox: { count: inboxCount, recent: recentInbox },
    recent_and_relevant: merged.slice(0, 12),
    areas,
  }

  res.json(response)
})
