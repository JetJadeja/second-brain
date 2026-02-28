import type { ParaBucket, ParaTreeNode } from '@second-brain/shared'

export function buildTree(
  buckets: ParaBucket[],
  noteCounts: Map<string, number>,
): ParaTreeNode[] {
  const byId = new Map<string, ParaTreeNode>()

  for (const b of buckets) {
    byId.set(b.id, {
      id: b.id,
      name: b.name,
      type: b.type,
      parent_id: b.parent_id,
      description: b.description ?? null,
      is_active: b.is_active,
      is_system: b.is_system,
      sort_order: b.sort_order,
      note_count: noteCounts.get(b.id) ?? 0,
      children: [],
    })
  }

  const roots: ParaTreeNode[] = []
  for (const node of byId.values()) {
    if (node.parent_id) {
      byId.get(node.parent_id)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  addDescendantCounts(roots)
  return roots
}

function addDescendantCounts(nodes: ParaTreeNode[]): number {
  let total = 0
  for (const node of nodes) {
    const childTotal = addDescendantCounts(node.children)
    node.note_count += childTotal
    total += node.note_count
  }
  return total
}
