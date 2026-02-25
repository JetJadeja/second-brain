import type { ParaBucket } from '@second-brain/shared'

export function buildPathMap(buckets: ParaBucket[]): Map<string, string> {
  const byId = new Map<string, ParaBucket>()
  for (const b of buckets) byId.set(b.id, b)

  const pathMap = new Map<string, string>()
  for (const b of buckets) {
    const segments: string[] = []
    let current: ParaBucket | undefined = b
    while (current) {
      segments.unshift(current.name)
      current = current.parent_id ? byId.get(current.parent_id) : undefined
    }
    pathMap.set(b.id, segments.join('/'))
  }
  return pathMap
}
