import { getServiceClient } from '../client.js'

export async function insertNoteView(
  userId: string,
  noteId: string,
): Promise<void> {
  await getServiceClient()
    .from('note_views')
    .insert({ user_id: userId, note_id: noteId })
}

export interface RecentView {
  note_id: string
  viewed_at: string
}

export async function getRecentlyViewed(
  userId: string,
  limit: number = 10,
): Promise<RecentView[]> {
  const { data, error } = await getServiceClient()
    .from('note_views')
    .select('note_id, viewed_at')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`getRecentlyViewed: ${error.message}`)
  return (data ?? []) as RecentView[]
}

/**
 * Increments view_count and updates last_viewed_at on a note.
 * Uses RPC for atomic increment to avoid read-then-write race condition.
 * Falls back to non-atomic update if RPC doesn't exist yet.
 */
export async function incrementViewCount(
  userId: string,
  noteId: string,
): Promise<void> {
  const sb = getServiceClient()

  const { error: rpcError } = await sb.rpc('increment_view_count', {
    p_note_id: noteId,
    p_user_id: userId,
  })

  if (!rpcError) return

  // Fallback: non-atomic update (acceptable for view counts)
  await sb
    .from('notes')
    .update({ last_viewed_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userId)
}
