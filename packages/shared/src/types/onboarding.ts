export const ONBOARDING_PHASES = ['projects', 'areas', 'resources', 'done'] as const
export type OnboardingPhase = (typeof ONBOARDING_PHASES)[number]

export interface OnboardingState {
  userId: string
  phase: OnboardingPhase
  isComplete: boolean
}
