import { getOnboardingState } from '@second-brain/db'
import { isOnboarding, setOnboarding } from './onboarding-store.js'

/**
 * Checks whether the user is currently onboarding.
 * Checks in-memory store first, falls back to database on miss.
 */
export async function loadIsOnboarding(userId: string): Promise<boolean> {
  if (isOnboarding(userId)) return true

  return await checkDatabase(userId)
}

async function checkDatabase(userId: string): Promise<boolean> {
  try {
    const state = await getOnboardingState(userId)
    if (!state || state.isComplete) return false

    setOnboarding(userId)
    return true
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[loadIsOnboarding] DB fallback failed:', msg)
    return false
  }
}
