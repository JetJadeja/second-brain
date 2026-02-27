import type { Note, DashboardInboxItem, DashboardNote } from '@second-brain/shared'
import type { RecentView } from '@second-brain/db'
import { getNotesByIds } from '@second-brain/db'
import { getBucketPath } from '../para/para-cache.js'

export async function buildDashboardInbox(
  userId: string,
  inboxNotes: Note[],
): Promise<DashboardInboxItem[]> {
  return Promise.all(
    inboxNotes.map(async (n) => ({
      id: n.id,
      title: n.title,
      ai_summary: n.ai_summary,
      source_type: n.source_type,
      source: n.source,
      ai_suggested_bucket: n.ai_suggested_bucket,
      ai_suggested_bucket_path: await getBucketPath(userId, n.ai_suggested_bucket),
      ai_confidence: n.ai_confidence,
      captured_at: n.captured_at,
    })),
  )
}

export async function buildDashboardRecent(
  userId: string,
  recentNotes: Note[],
  recentViews: RecentView[],
): Promise<DashboardNote[]> {
  const seenIds = new Set<string>()
  const merged: DashboardNote[] = []

  for (const n of recentNotes) {
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

  const missingIds = recentViews
    .map((v) => v.note_id)
    .filter((id) => !seenIds.has(id))

  if (missingIds.length > 0) {
    const viewedNotes = await getNotesByIds(userId, missingIds)
    for (const n of viewedNotes) {
      if (seenIds.has(n.id) || !n.is_classified) continue
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
  }

  return merged
}
