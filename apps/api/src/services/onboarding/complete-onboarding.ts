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
    ? `all set! here's what we built:\n\n${summary}\n\nsend me anything and I'll file it`
    : "ready to go — send me anything and I'll organize it"
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
