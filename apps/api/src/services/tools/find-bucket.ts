import type { ParaBucket } from '@second-brain/shared'

export function findBucketByName(buckets: ParaBucket[], query: string): ParaBucket | null {
  const lower = query.toLowerCase().trim()

  const exactMatch = buckets.find((b) => b.name.toLowerCase() === lower)
  if (exactMatch) return exactMatch

  const segments = lower.split(/\s*>\s*/).map((s) => s.trim())
  const lastName = segments[segments.length - 1]
  if (!lastName) return null

  const nameMatches = buckets.filter((b) => b.name.toLowerCase() === lastName)
  if (nameMatches.length === 1) return nameMatches[0]!

  for (const candidate of nameMatches) {
    if (matchesPathSegments(buckets, candidate, segments)) return candidate
  }

  return nameMatches[0] ?? null
}

function matchesPathSegments(
  buckets: ParaBucket[],
  bucket: ParaBucket,
  segments: string[],
): boolean {
  let current: ParaBucket | undefined = bucket
  for (let i = segments.length - 1; i >= 0; i--) {
    if (!current || current.name.toLowerCase() !== segments[i]) return false
    current = current.parent_id
      ? buckets.find((b) => b.id === current!.parent_id)
      : undefined
  }
  return true
}
