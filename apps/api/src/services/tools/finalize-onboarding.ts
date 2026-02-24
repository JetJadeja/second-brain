import { getAllBuckets, markOnboardingComplete } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
// TODO: Update imports when onboarding moves to API in B.5
// import { createOnboardingBuckets } from '../onboarding/create-onboarding-buckets.js'
// import { clearOnboarding } from '../onboarding/onboarding-store.js'

interface BucketSpec {
  name: string
  type: 'project' | 'area' | 'resource'
  parentName: string | null
  description?: string
}

export interface FinalizeOnboardingResult {
  created: string[]
  summary: string
}

export async function executeFinalizeOnboarding(
  _userId: string,
  _buckets: BucketSpec[],
): Promise<FinalizeOnboardingResult> {
  // Placeholder until onboarding moves in B.5
  throw new Error('finalize-onboarding not yet wired — waiting for B.5')
}

export function buildStructureSummary(buckets: ParaBucket[]): string {
  const lines: string[] = []

  for (const type of ['project', 'area', 'resource'] as const) {
    const roots = buckets.filter((b) => b.type === type && b.parent_id !== null)
    if (roots.length === 0) continue

    const label = type === 'project' ? 'Projects' : type === 'area' ? 'Areas' : 'Resources'
    const rootContainerId = buckets.find((b) => b.type === type && b.parent_id === null)?.id

    const topLevel = roots.filter((b) => b.parent_id === rootContainerId)
    const names = topLevel.map((b) => {
      const children = buckets.filter((c) => c.parent_id === b.id)
      if (children.length === 0) return b.name
      return `${b.name} (${children.map((c) => c.name).join(', ')})`
    })

    lines.push(`${label}: ${names.join(', ')}`)
  }

  return lines.join('\n')
}
