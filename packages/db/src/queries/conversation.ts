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
  limit: number = 20,
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
