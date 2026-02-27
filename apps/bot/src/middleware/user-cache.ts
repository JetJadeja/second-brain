const TTL_MS = 60 * 1000 // 60 seconds

interface CacheEntry {
  userId: string
  cachedAt: number
}

const cache = new Map<number, CacheEntry>()

export function getCachedUserId(telegramId: number): string | null {
  const entry = cache.get(telegramId)
  if (!entry) return null

  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(telegramId)
    return null
  }

  return entry.userId
}

export function cacheUserId(telegramId: number, userId: string): void {
  cache.set(telegramId, { userId, cachedAt: Date.now() })
}

export function invalidateUser(telegramId: number): void {
  cache.delete(telegramId)
}
