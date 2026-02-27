import { BoundedMap } from '../bounded-map.js'

const TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_UPDATES = 2000

const processedUpdates = new BoundedMap<true>(TTL_MS, MAX_UPDATES)

export function hasProcessed(updateId: number): boolean {
  return processedUpdates.get(String(updateId)) === true
}

export function markProcessed(updateId: number): void {
  processedUpdates.set(String(updateId), true)
}
