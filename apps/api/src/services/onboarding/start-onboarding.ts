import { upsertOnboardingState } from '@second-brain/db'
import { setOnboarding } from './onboarding-store.js'
import { ensureRootBuckets } from './ensure-root-buckets.js'

/**
 * Starts the onboarding flow for a newly linked user.
 * Ensures root PARA buckets exist and sets onboarding state.
 * The agent handles the actual conversation.
 */
export async function startOnboarding(userId: string): Promise<void> {
  await ensureRootBuckets(userId)

  setOnboarding(userId)
  upsertOnboardingState(userId, 'projects').catch((err) =>
    console.error('[start-onboarding] upsert failed:', err),
  )
}
