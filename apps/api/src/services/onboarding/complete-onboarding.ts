import { getAllBuckets, markOnboardingComplete } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
import { clearOnboarding } from './onboarding-store.js'

/**
 * Completes the onboarding flow. Clears onboarding state and
 * returns a summary message for the caller to send.
 */
export async function completeOnboarding(userId: string): Promise<string> {
  // Clear onboarding state
  clearOnboarding(userId)
  markOnboardingComplete(userId).catch(() => {})

  // Build summary
  const buckets = await getAllBuckets(userId)
  const summary = buildStructureSummary(buckets)

  return summary
    ? `Your Second Brain is ready! Here's your folder structure:\n\n${summary}\n\n` +
      "You can always add more folders later — just tell me " +
      "'create a resource folder for Espresso Machines' or anything like that. " +
      "Now send me anything and I'll organize it!"
    : "You're all set! Send me anything — links, thoughts, images — " +
      "and I'll save it to your second brain. " +
      "You can create folders anytime by telling me."
}

function buildStructureSummary(buckets: ParaBucket[]): string {
  const lines: string[] = []

  for (const type of ['project', 'area', 'resource'] as const) {
    const children = buckets.filter(
      (b) => b.type === type && b.parent_id !== null,
    )
    if (children.length === 0) continue

    const label = type === 'project' ? 'Projects' : type === 'area' ? 'Areas' : 'Resources'
    const names = children.map((b) => b.name).join(', ')
    lines.push(`${label}: ${names}`)
  }

  return lines.join('\n')
}
