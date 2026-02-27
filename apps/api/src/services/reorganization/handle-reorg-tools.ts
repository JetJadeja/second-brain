import {
  getNotesByBucket,
  getBucketStats,
  getAllBuckets,
  countNotesByBucket,
} from '@second-brain/db'

export async function executeReorgTool(
  name: string,
  input: Record<string, unknown>,
  userId: string,
): Promise<string> {
  switch (name) {
    case 'inspect_bucket':
      return inspectBucket(userId, input['bucket_id'] as string)
    case 'get_bucket_activity':
      return getBucketActivity(userId, input['bucket_id'] as string)
    case 'list_empty_buckets':
      return listEmptyBuckets(userId)
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` })
  }
}

async function inspectBucket(userId: string, bucketId: string): Promise<string> {
  const { data: notes } = await getNotesByBucket(userId, bucketId, { limit: 50 })
  const items = notes.map((n) => ({
    id: n.id,
    title: n.title,
    summary: n.ai_summary ?? null,
  }))
  return JSON.stringify({ bucket_id: bucketId, notes: items })
}

async function getBucketActivity(userId: string, bucketId: string): Promise<string> {
  const stats = await getBucketStats(userId, [bucketId])
  const daysSinceLastNote = stats.lastCaptureAt
    ? Math.floor((Date.now() - new Date(stats.lastCaptureAt).getTime()) / 86400000)
    : null

  return JSON.stringify({
    bucket_id: bucketId,
    note_count: stats.noteCount,
    last_capture_at: stats.lastCaptureAt,
    days_since_last_note: daysSinceLastNote,
  })
}

async function listEmptyBuckets(userId: string): Promise<string> {
  const buckets = await getAllBuckets(userId)
  const stats = await countNotesByBucket(userId)

  const empty = buckets
    .filter((b) => b.parent_id !== null && (stats.counts.get(b.id) ?? 0) === 0)
    .map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      created_at: b.created_at,
    }))

  return JSON.stringify({ empty_buckets: empty })
}
