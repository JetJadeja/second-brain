import { saveConversationMessage, deleteOldConversationMessages } from '@second-brain/db'
import type { ConversationRole } from '@second-brain/shared'
import { addEntry, MAX_ENTRIES } from './conversation-store.js'

/**
 * Records a user message in both in-memory store and database.
 * DB write is fire-and-forget.
 */
export function recordUserMessage(userId: string, content: string): void {
  recordEntry(userId, 'user', content, [])
}

/**
 * Records a bot response in both in-memory store and database.
 * Summary should be compact (goes into LLM prompt).
 * DB write is fire-and-forget.
 */
export function recordBotResponse(
  userId: string,
  summary: string,
  noteIds: string[] = [],
): void {
  recordEntry(userId, 'assistant', summary, noteIds)
}

function recordEntry(
  userId: string,
  role: ConversationRole,
  content: string,
  noteIds: string[],
): void {
  // Synchronous in-memory write
  addEntry(userId, {
    role,
    content,
    noteIds,
    timestamp: Date.now(),
  })

  // Async DB write + cleanup (fire-and-forget)
  saveConversationMessage(userId, role, content, noteIds).catch((err) =>
    console.error('[record-exchange] save failed:', err),
  )
  deleteOldConversationMessages(userId, MAX_ENTRIES).catch((err) =>
    console.error('[record-exchange] cleanup failed:', err),
  )
}
