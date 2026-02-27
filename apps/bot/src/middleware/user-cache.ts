import { BoundedMap } from '../bounded-map.js'

const TTL_MS = 60 * 1000 // 60 seconds
const MAX_USERS = 1000

const cache = new BoundedMap<string>(TTL_MS, MAX_USERS)

export function getCachedUserId(telegramId: number): string | null {
  return cache.get(String(telegramId)) ?? null
}

export function cacheUserId(telegramId: number, userId: string): void {
  cache.set(String(telegramId), userId)
}

export function invalidateUser(telegramId: number): void {
  cache.delete(String(telegramId))
}
