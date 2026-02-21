import { getOnboardingState } from '@second-brain/db'
import type { OnboardingPhase } from '@second-brain/shared'
import { getOnboardingPhase, setOnboardingPhase } from './onboarding-store.js'

/**
 * Loads the current onboarding phase for a user.
 * Returns the phase if the user is actively onboarding, null otherwise.
 * Checks in-memory store first, falls back to database on miss.
 */
export async function loadOnboardingPhase(
  userId: string,
): Promise<OnboardingPhase | null> {
  // Check memory first
  const cached = getOnboardingPhase(userId)
  if (cached) return cached

  // Cache miss — check database
  return await loadFromDatabase(userId)
}

async function loadFromDatabase(userId: string): Promise<OnboardingPhase | null> {
  try {
    const state = await getOnboardingState(userId)
    if (!state || state.isComplete) return null

    // Populate in-memory store
    setOnboardingPhase(userId, state.phase)
    return state.phase
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[loadOnboardingPhase] DB fallback failed:', msg)
    return null
  }
}
