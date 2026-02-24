import {
  getAllBuckets,
  getNotesByBucket,
  createSuggestion,
  hasPendingSuggestion,
} from '@second-brain/db'

const STALE_DAYS = 30

export async function checkStaleProjects(userId: string): Promise<number> {
  const buckets = await getAllBuckets(userId)
  const projectBuckets = buckets.filter(
    (b) => b.type === 'project' && b.parent_id !== null,
  )

  let suggestionsCreated = 0

  for (const bucket of projectBuckets) {
    const alreadyExists = await hasPendingSuggestion(
      userId, 'archive_project', 'bucket_id', bucket.id,
    )
    if (alreadyExists) continue

    const daysInactive = await getDaysInactive(userId, bucket.id)
    if (daysInactive === null || daysInactive < STALE_DAYS) continue

    await createSuggestion(userId, 'archive_project', {
      bucket_id: bucket.id,
      bucket_name: bucket.name,
      days_inactive: daysInactive,
    })

    suggestionsCreated++
  }

  return suggestionsCreated
}

async function getDaysInactive(
  userId: string,
  bucketId: string,
): Promise<number | null> {
  const { data: notes } = await getNotesByBucket(userId, bucketId, { limit: 1 })
  const latest = notes[0]
  if (!latest) return null

  const latestDate = new Date(latest.captured_at)
  const now = new Date()
  const diffMs = now.getTime() - latestDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
