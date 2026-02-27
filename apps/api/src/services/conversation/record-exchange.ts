import { saveConversationMessage, deleteOldConversationMessages } from '@second-brain/db'
import type { ConversationRole } from '@second-brain/shared'
import { addEntry, MAX_ENTRIES } from './conversation-store.js'
import { fireAndRetry } from '../../middleware/retry-async.js'

const CLEANUP_INTERVAL = 50
const messageCounter = new Map<string, number>()

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
  addEntry(userId, {
    role,
    content,
    noteIds,
    timestamp: Date.now(),
  })

  fireAndRetry('conversation-save', () =>
    saveConversationMessage(userId, role, content, noteIds),
  )

  const count = (messageCounter.get(userId) ?? 0) + 1
  messageCounter.set(userId, count)

  if (count % CLEANUP_INTERVAL === 0) {
    fireAndRetry('conversation-cleanup', () =>
      deleteOldConversationMessages(userId, MAX_ENTRIES),
    )
  }
}
