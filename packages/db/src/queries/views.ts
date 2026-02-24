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

export async function incrementViewCount(
  userId: string,
  noteId: string,
): Promise<void> {
  const sb = getServiceClient()

  const { data: note } = await sb
    .from('notes')
    .select('view_count')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (note) {
    await sb
      .from('notes')
      .update({
        view_count: (note.view_count as number) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', noteId)
  }
}
