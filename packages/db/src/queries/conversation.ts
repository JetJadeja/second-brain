import { getServiceClient } from '../client.js'
import type { ConversationEntry, ConversationRole } from '@second-brain/shared'

export async function saveConversationMessage(
  userId: string,
  role: ConversationRole,
  content: string,
  noteIds: string[] = [],
): Promise<void> {
  try {
    const { error } = await getServiceClient()
      .from('conversation_messages')
      .insert({
        user_id: userId,
        role,
        content,
        note_ids: noteIds,
      })

    if (error) {
      console.error('[saveConversationMessage] Insert failed:', error.message)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[saveConversationMessage] Failed:', msg)
  }
}

export async function getRecentConversation(
  userId: string,
  limit: number = 500,
): Promise<ConversationEntry[]> {
  const { data, error } = await getServiceClient()
    .from('conversation_messages')
    .select('role, content, note_ids, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[getRecentConversation] Query failed:', error.message)
    return []
  }

  if (!data || data.length === 0) return []

  // Reverse to chronological order
  return data.reverse().map((row) => ({
    role: row.role as ConversationRole,
    content: row.content as string,
    noteIds: (row.note_ids as string[]) ?? [],
    timestamp: new Date(row.created_at as string).getTime(),
  }))
}

export async function deleteOldConversationMessages(
  userId: string,
  keepCount: number,
): Promise<void> {
  try {
    // Find the cutoff timestamp: the created_at of the Nth most recent message
    const { data: cutoffRow, error: cutoffError } = await getServiceClient()
      .from('conversation_messages')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(keepCount, keepCount)
      .limit(1)

    if (cutoffError) {
      console.error('[deleteOldConversationMessages] Cutoff query failed:', cutoffError.message)
      return
    }

    // No row at that offset means user has <= keepCount messages
    const oldest = cutoffRow?.[0]
    if (!oldest) return

    const cutoff = oldest.created_at as string

    // Delete all messages at or before the cutoff
    const { error: deleteError } = await getServiceClient()
      .from('conversation_messages')
      .delete()
      .eq('user_id', userId)
      .lte('created_at', cutoff)

    if (deleteError) {
      console.error('[deleteOldConversationMessages] Delete failed:', deleteError.message)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[deleteOldConversationMessages] Failed:', msg)
  }
}
