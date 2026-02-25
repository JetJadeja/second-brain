import { getRecentConversation } from '@second-brain/db'
import type { ConversationEntry } from '@second-brain/shared'
import { hasHistory, getHistory, addEntry, MAX_ENTRIES } from './conversation-store.js'

/**
 * Loads conversation history for a user.
 * Reads from in-memory store first. On cache miss (e.g., after restart),
 * falls back to database and populates the in-memory store.
 */
export async function loadHistory(userId: string): Promise<ConversationEntry[]> {
  if (hasHistory(userId)) {
    return getHistory(userId)
  }

  // Cache miss — try loading from database
  const entries = await loadFromDatabase(userId)
  if (entries.length === 0) return []

  // Populate in-memory store
  for (const entry of entries) {
    addEntry(userId, entry)
  }

  return getHistory(userId)
}

async function loadFromDatabase(userId: string): Promise<ConversationEntry[]> {
  try {
    return await getRecentConversation(userId, MAX_ENTRIES)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[loadHistory] DB fallback failed:', msg)
    return []
  }
}
