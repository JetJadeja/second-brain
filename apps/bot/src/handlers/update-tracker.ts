const TTL_MS = 10 * 60 * 1000 // 10 minutes

const processedUpdates = new Map<number, number>()

export function hasProcessed(updateId: number): boolean {
  const storedAt = processedUpdates.get(updateId)
  if (storedAt === undefined) return false

  if (Date.now() - storedAt > TTL_MS) {
    processedUpdates.delete(updateId)
    return false
  }

  return true
}

export function markProcessed(updateId: number): void {
  processedUpdates.set(updateId, Date.now())

  // Lazy cleanup — remove expired entries
  for (const [id, timestamp] of processedUpdates) {
    if (Date.now() - timestamp > TTL_MS) {
      processedUpdates.delete(id)
    }
  }
}
