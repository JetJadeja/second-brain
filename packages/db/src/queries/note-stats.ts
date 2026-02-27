import { getServiceClient } from '../client.js'

export async function countNotesByBucket(
  userId: string,
): Promise<Map<string, number>> {
  const { data, error } = await getServiceClient()
    .from('notes')
    .select('bucket_id')
    .eq('user_id', userId)
    .not('bucket_id', 'is', null)

  if (error) throw new Error(`countNotesByBucket: ${error.message}`)

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const bid = row.bucket_id as string
    counts.set(bid, (counts.get(bid) ?? 0) + 1)
  }
  return counts
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
