import { getServiceClient } from '@second-brain/db'
import type { ParaBucket, ParaTreeNode } from '@second-brain/shared'

export async function fetchNoteCounts(
  userId: string,
): Promise<Map<string, number>> {
  const sb = getServiceClient()
  const { data } = await sb
    .from('notes')
    .select('bucket_id')
    .eq('user_id', userId)
    .not('bucket_id', 'is', null)

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const bid = row.bucket_id as string
    counts.set(bid, (counts.get(bid) ?? 0) + 1)
  }
  return counts
}

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
