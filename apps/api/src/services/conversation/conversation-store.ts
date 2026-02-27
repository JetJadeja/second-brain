import type { ConversationEntry } from '@second-brain/shared'

const MAX_ENTRIES = 500
const MAX_USERS = 1000

const store = new Map<string, ConversationEntry[]>()
const lastAccess = new Map<string, number>()

export function addEntry(userId: string, entry: ConversationEntry): void {
  const entries = store.get(userId) ?? []
  entries.push(entry)

  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES)
  }

  store.set(userId, entries)
  lastAccess.set(userId, Date.now())

  if (store.size > MAX_USERS) {
    evictLeastRecentUser()
  }
}

export function getHistory(userId: string): ConversationEntry[] {
  lastAccess.set(userId, Date.now())
  return store.get(userId) ?? []
}

export function hasHistory(userId: string): boolean {
  const entries = store.get(userId)
  return !!entries && entries.length > 0
}

export function clearHistory(userId: string): void {
  store.delete(userId)
  lastAccess.delete(userId)
}

function evictLeastRecentUser(): void {
  let oldestId: string | null = null
  let oldestTime = Infinity

  for (const [id, time] of lastAccess) {
    if (time < oldestTime) {
      oldestTime = time
      oldestId = id
    }
  }

  if (oldestId) {
    store.delete(oldestId)
    lastAccess.delete(oldestId)
  }
}

export { MAX_ENTRIES }
