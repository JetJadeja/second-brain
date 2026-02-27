import { getServiceClient } from '../client.js'

export interface BucketNoteStats {
  counts: Map<string, number>
  lastCapture: Map<string, string>
}

export async function countNotesByBucket(
  userId: string,
): Promise<BucketNoteStats> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .select('bucket_id, captured_at')
    .eq('user_id', userId)
    .not('bucket_id', 'is', null)

  if (error) throw new Error(`countNotesByBucket: ${error.message}`)

  const counts = new Map<string, number>()
  const lastCapture = new Map<string, string>()

  for (const row of data ?? []) {
    const bid = row.bucket_id as string
    const capturedAt = row.captured_at as string

    counts.set(bid, (counts.get(bid) ?? 0) + 1)

    const existing = lastCapture.get(bid)
    if (!existing || capturedAt > existing) {
      lastCapture.set(bid, capturedAt)
    }
  }

  return { counts, lastCapture }
}

export async function countUnannotatedNotes(userId: string): Promise<number> {
  const { count, error } = await getServiceClient()
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('distillation_status', 'raw')
    .not('bucket_id', 'is', null)

  if (error) throw new Error(`countUnannotatedNotes: ${error.message}`)
  return count ?? 0
}

export async function getSampleNoteTitles(
  userId: string,
  perBucket: number = 3,
  bucketIds?: string[],
): Promise<Map<string, string[]>> {
  let query = getServiceClient()
    .from('notes')
    .select('title, bucket_id')
    .eq('user_id', userId)
    .not('bucket_id', 'is', null)
    .order('captured_at', { ascending: false })
    .limit(200)

  if (bucketIds && bucketIds.length > 0) {
    query = query.in('bucket_id', bucketIds)
  }

  const { data, error } = await query

  if (error) throw new Error(`getSampleNoteTitles: ${error.message}`)

  const result = new Map<string, string[]>()
  for (const row of data ?? []) {
    const bid = row.bucket_id as string
    const titles = result.get(bid) ?? []
    if (titles.length < perBucket) {
      titles.push(row.title as string)
      result.set(bid, titles)
    }
  }
  return result
}
