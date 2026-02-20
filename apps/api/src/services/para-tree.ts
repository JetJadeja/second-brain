import { getServiceClient } from '@second-brain/db'
import type { ParaBucket, ParaTreeNode } from '@second-brain/shared'

interface CacheEntry {
  buckets: ParaBucket[]
  tree: ParaTreeNode[]
  pathMap: Map<string, string>
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

export function invalidateParaCache(userId: string): void {
  cache.delete(userId)
}

export async function getParaTree(userId: string): Promise<ParaTreeNode[]> {
  const entry = await ensureCached(userId)
  return entry.tree
}

export async function getBucketPath(
  userId: string,
  bucketId: string | null,
): Promise<string | null> {
  if (!bucketId) return null
  const entry = await ensureCached(userId)
  return entry.pathMap.get(bucketId) ?? null
}

export async function getAllBuckets(userId: string): Promise<ParaBucket[]> {
  const entry = await ensureCached(userId)
  return entry.buckets
}

async function ensureCached(userId: string): Promise<CacheEntry> {
  const existing = cache.get(userId)
  if (existing && Date.now() - existing.timestamp < TTL_MS) {
    return existing
  }

  const sb = getServiceClient()
  const { data, error } = await sb
    .from('para_buckets')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')

  if (error) throw new Error(`Failed to fetch buckets: ${error.message}`)

  const buckets = (data ?? []) as ParaBucket[]
  const noteCounts = await fetchNoteCounts(userId)
  const tree = buildTree(buckets, noteCounts)
  const pathMap = buildPathMap(buckets)

  const entry: CacheEntry = { buckets, tree, pathMap, timestamp: Date.now() }
  cache.set(userId, entry)
  return entry
}

async function fetchNoteCounts(
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

function buildTree(
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

function buildPathMap(buckets: ParaBucket[]): Map<string, string> {
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
