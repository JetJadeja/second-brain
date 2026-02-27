const DEFAULT_MAX_SIZE = 1000
const CLEANUP_INTERVAL_MS = 60 * 1000

interface TimedEntry<T> {
  value: T
  storedAt: number
}

export class BoundedMap<T> {
  private map = new Map<string, TimedEntry<T>>()
  private timer: ReturnType<typeof setInterval>

  constructor(
    private readonly ttlMs: number,
    private readonly maxSize = DEFAULT_MAX_SIZE,
  ) {
    this.timer = setInterval(() => this.sweep(), CLEANUP_INTERVAL_MS)
    if (typeof this.timer.unref === 'function') this.timer.unref()
  }

  get(key: string): T | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.storedAt > this.ttlMs) {
      this.map.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: string, value: T): void {
    if (!this.map.has(key) && this.map.size >= this.maxSize) this.evictOldest()
    this.map.set(key, { value, storedAt: Date.now() })
  }

  delete(key: string): void {
    this.map.delete(key)
  }

  get size(): number {
    return this.map.size
  }

  dispose(): void {
    clearInterval(this.timer)
    this.map.clear()
  }

  private sweep(): void {
    const now = Date.now()
    for (const [key, entry] of this.map) {
      if (now - entry.storedAt > this.ttlMs) this.map.delete(key)
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity
    for (const [key, entry] of this.map) {
      if (entry.storedAt < oldestTime) {
        oldestTime = entry.storedAt
        oldestKey = key
      }
    }
    if (oldestKey) this.map.delete(oldestKey)
  }
}
