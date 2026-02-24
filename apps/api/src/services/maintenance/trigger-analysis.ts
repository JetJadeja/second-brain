import { analyzeBuckets } from './analyze-buckets.js'

const TRIGGER_EVERY_N = 10
const saveCounts = new Map<string, number>()

export function maybeTriggerAnalysis(userId: string): void {
  const current = (saveCounts.get(userId) ?? 0) + 1
  saveCounts.set(userId, current)

  if (current < TRIGGER_EVERY_N) return

  saveCounts.set(userId, 0)

  // Fire-and-forget — errors handled inside analyzeBuckets
  analyzeBuckets(userId).catch(() => {})
}
