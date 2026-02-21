import type { OnboardingPhase } from '@second-brain/shared'

const store = new Map<string, OnboardingPhase>()

export function setOnboardingPhase(userId: string, phase: OnboardingPhase): void {
  if (phase === 'done') {
    store.delete(userId)
    return
  }
  store.set(userId, phase)
}

export function getOnboardingPhase(userId: string): OnboardingPhase | null {
  return store.get(userId) ?? null
}

export function isOnboarding(userId: string): boolean {
  return store.has(userId)
}

export function clearOnboarding(userId: string): void {
  store.delete(userId)
}
