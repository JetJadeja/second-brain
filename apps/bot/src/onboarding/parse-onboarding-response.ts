import type { OnboardingPhase } from '@second-brain/shared'

export interface BucketToCreate {
  name: string
  type: 'project' | 'area' | 'resource'
  parentName: string | null
}

export interface OnboardingAction {
  action: 'create_buckets' | 'probe' | 'skip_phase' | 'finish'
  buckets: BucketToCreate[]
  message: string
  nextPhase: OnboardingPhase | null
}

const FALLBACK_ACTION: OnboardingAction = {
  action: 'skip_phase',
  buckets: [],
  message: "I didn't quite catch that. Let's move on.",
  nextPhase: null,
}

export function parseOnboardingResponse(text: string): OnboardingAction {
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    return {
      action: parseAction(parsed['action']),
      buckets: parseBuckets(parsed['buckets']),
      message: String(parsed['message'] ?? ''),
      nextPhase: parseNextPhase(parsed['next_phase']),
    }
  } catch {
    console.error('[parseOnboardingResponse] Failed to parse:', text.slice(0, 200))
    return FALLBACK_ACTION
  }
}

function parseAction(value: unknown): OnboardingAction['action'] {
  const str = String(value ?? '').toLowerCase().trim()
  if (str === 'create_buckets' || str === 'probe' || str === 'skip_phase' || str === 'finish') {
    return str
  }
  return 'skip_phase'
}

function parseBuckets(value: unknown): BucketToCreate[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null)
    .map((b) => ({
      name: String(b['name'] ?? '').trim(),
      type: parseBucketType(b['type']),
      parentName: b['parent_name'] ? String(b['parent_name']).trim() : null,
    }))
    .filter((b) => b.name.length > 0)
}

function parseBucketType(value: unknown): 'project' | 'area' | 'resource' {
  const str = String(value ?? '').toLowerCase()
  if (str === 'project' || str === 'area' || str === 'resource') return str
  return 'project'
}

function parseNextPhase(value: unknown): OnboardingPhase | null {
  if (value === null || value === undefined) return null
  const str = String(value).toLowerCase()
  if (str === 'projects' || str === 'areas' || str === 'resources' || str === 'done') return str
  return null
}
