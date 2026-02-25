import type { ParaBucket } from '@second-brain/shared'

export class TypeMismatchError extends Error {
  constructor(rootType: string) {
    super(`Type must match root ancestor type: ${rootType}`)
    this.name = 'TypeMismatchError'
  }
}

export function validateBucketType(
  allBuckets: ParaBucket[],
  parentId: string,
  proposedType: string,
): void {
  let current = allBuckets.find((b) => b.id === parentId)
  while (current?.parent_id) {
    const parent = allBuckets.find((b) => b.id === current!.parent_id)
    if (!parent) break
    current = parent
  }

  if (current && current.type !== proposedType) {
    throw new TypeMismatchError(current.type)
  }
}
