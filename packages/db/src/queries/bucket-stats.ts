import { getServiceClient } from '../client.js'

export interface BucketStats {
  noteCount: number
  lastCaptureAt: string | null
}

/**
 * Gets aggregate note stats for a set of bucket IDs.
 * Returns total note count and most recent capture timestamp.
 */
export async function getBucketStats(
  userId: string,
  bucketIds: string[],
): Promise<BucketStats> {
  if (bucketIds.length === 0) {
    return { noteCount: 0, lastCaptureAt: null }
  }

  const sb = getServiceClient()

  const { count } = await sb
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('bucket_id', bucketIds)

  const { data: latest } = await sb
    .from('notes')
    .select('captured_at')
    .eq('user_id', userId)
    .in('bucket_id', bucketIds)
    .order('captured_at', { ascending: false })
    .limit(1)

  return {
    noteCount: count ?? 0,
    lastCaptureAt: (latest?.[0]?.captured_at as string) ?? null,
  }
}
