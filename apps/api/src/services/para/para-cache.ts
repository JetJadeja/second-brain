import { getServiceClient, countNotesByBucket } from '@second-brain/db'
import type { ParaBucket, ParaTreeNode } from '@second-brain/shared'
import { buildTree } from './build-enriched-tree.js'
import { buildPathMap } from './build-path-map.js'

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
  const stats = await countNotesByBucket(userId)
  const tree = buildTree(buckets, stats.counts)
  const pathMap = buildPathMap(buckets)

  const entry: CacheEntry = { buckets, tree, pathMap, timestamp: Date.now() }
  cache.set(userId, entry)
  return entry
}
