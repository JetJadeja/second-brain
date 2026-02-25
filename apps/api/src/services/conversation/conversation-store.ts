import type { ConversationEntry } from '@second-brain/shared'

const MAX_ENTRIES = 500

const store = new Map<string, ConversationEntry[]>()

export function addEntry(userId: string, entry: ConversationEntry): void {
  const entries = store.get(userId) ?? []
  entries.push(entry)

  // Trim from front if over limit
  while (entries.length > MAX_ENTRIES) {
    entries.shift()
  }

  store.set(userId, entries)
}

export function getHistory(userId: string): ConversationEntry[] {
  return store.get(userId) ?? []
}

export function hasHistory(userId: string): boolean {
  const entries = store.get(userId)
  return !!entries && entries.length > 0
}

export function clearHistory(userId: string): void {
  store.delete(userId)
}

export { MAX_ENTRIES }
