import { getServiceClient } from '../client.js'

export async function countNotesByBucket(
  userId: string,
): Promise<Map<string, number>> {
  const { data } = await getServiceClient()
    .from('notes')
    .select('bucket_id')
    .eq('user_id', userId)
    .not('bucket_id', 'is', null)

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const bid = row.bucket_id as string
    counts.set(bid, (counts.get(bid) ?? 0) + 1)
  }
  return counts
}

export async function getSampleNoteTitles(
  userId: string,
  perBucket: number = 3,
): Promise<Map<string, string[]>> {
  const { data } = await getServiceClient()
    .from('notes')
    .select('title, bucket_id')
    .eq('user_id', userId)
    .not('bucket_id', 'is', null)
    .order('captured_at', { ascending: false })
    .limit(200)

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
