import { getServiceClient } from '../client.js'
import type { OnboardingState, OnboardingPhase } from '@second-brain/shared'

export async function getOnboardingState(
  userId: string,
): Promise<OnboardingState | null> {
  const { data, error } = await getServiceClient()
    .from('user_onboarding')
    .select('user_id, phase, is_complete')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    userId: data.user_id as string,
    phase: data.phase as OnboardingPhase,
    isComplete: data.is_complete as boolean,
  }
}

export async function upsertOnboardingState(
  userId: string,
  phase: OnboardingPhase,
  isComplete: boolean = false,
): Promise<void> {
  try {
    const { error } = await getServiceClient()
      .from('user_onboarding')
      .upsert(
        { user_id: userId, phase, is_complete: isComplete },
        { onConflict: 'user_id' },
      )

    if (error) {
      console.error('[upsertOnboardingState] Failed:', error.message)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[upsertOnboardingState] Failed:', msg)
  }
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  try {
    const { error } = await getServiceClient()
      .from('user_onboarding')
      .upsert(
        { user_id: userId, phase: 'done', is_complete: true },
        { onConflict: 'user_id' },
      )

    if (error) {
      console.error('[markOnboardingComplete] Failed:', error.message)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[markOnboardingComplete] Failed:', msg)
  }
}
