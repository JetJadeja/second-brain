import type { ParaBucket, ParaTreeNode } from '../types/index.js'

export function buildParaTree(buckets: ParaBucket[]): ParaTreeNode[] {
  const nodeMap = new Map<string, ParaTreeNode>()

  // Create nodes
  for (const b of buckets) {
    nodeMap.set(b.id, {
      id: b.id,
      name: b.name,
      type: b.type,
      parent_id: b.parent_id,
      description: b.description ?? null,
      is_active: b.is_active,
      sort_order: b.sort_order,
      note_count: 0,
      children: [],
    })
  }

  // Build hierarchy
  const roots: ParaTreeNode[] = []
  for (const node of nodeMap.values()) {
    if (node.parent_id && nodeMap.has(node.parent_id)) {
      nodeMap.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  // Sort children
  for (const node of nodeMap.values()) {
    node.children.sort((a, b) => a.sort_order - b.sort_order)
  }
  roots.sort((a, b) => a.sort_order - b.sort_order)

  return roots
}
