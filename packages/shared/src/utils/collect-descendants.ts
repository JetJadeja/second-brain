/**
 * Collects all descendant IDs of a given root node using BFS traversal.
 * Works on any array of items with `id` and `parent_id` fields.
 */
export function collectDescendantIds<
  T extends { id: string; parent_id: string | null },
>(rootId: string, items: T[], includeRoot = true): string[] {
  const ids: string[] = includeRoot ? [rootId] : []
  const queue = [rootId]

  while (queue.length > 0) {
    const parentId = queue.shift()!
    for (const item of items) {
      if (item.parent_id === parentId) {
        ids.push(item.id)
        queue.push(item.id)
      }
    }
  }

  return ids
}
