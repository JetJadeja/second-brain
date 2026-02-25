import type { ReviewData, ReviewSection } from '../types/review.types'

const STORAGE_KEY = 'second-brain-last-reviewed'

export const ALL_SECTIONS: ReviewSection[] = ['inbox', 'projects', 'areas', 'connections', 'orphans', 'distillation']

export function loadLastReviewed(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function saveLastReviewed(): void {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString())
}

export function computeInitialCompletion(result: ReviewData): Partial<Record<ReviewSection, boolean>> {
  const updates: Partial<Record<ReviewSection, boolean>> = {}
  if (result.inbox_count === 0) updates.inbox = true
  if (result.connections.length === 0) updates.connections = true
  if (result.orphans.length === 0) updates.orphans = true
  if (result.nudges.length === 0) updates.distillation = true
  return updates
}
