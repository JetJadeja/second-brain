import { useState, useCallback, useMemo } from 'react'
import { getParaTree, createBucket } from '@/features/bucket/services/bucket.service'
import type { ParaType } from '@/types/enums'
import type { BucketTreeItem } from '@/components/layout/types'

type ApiNode = {
  id: string
  name: string
  type: string
  note_count: number
  children: ApiNode[]
}

function mapNode(node: ApiNode): BucketTreeItem {
  return {
    id: node.id,
    name: node.name,
    paraType: node.type as ParaType,
    noteCount: node.note_count,
    children: node.children.map(mapNode),
  }
}

function filterTree(items: BucketTreeItem[], query: string): BucketTreeItem[] {
  const lower = query.toLowerCase()
  return items.reduce<BucketTreeItem[]>((acc, item) => {
    const matchesSelf = item.name.toLowerCase().includes(lower)
    const matchedChildren = filterTree(item.children, query)
    if (matchesSelf || matchedChildren.length > 0) {
      acc.push({ ...item, children: matchesSelf ? item.children : matchedChildren })
    }
    return acc
  }, [])
}

export type RootContainer = { id: string; type: ParaType }

export function useBucketPicker() {
  const [buckets, setBuckets] = useState<BucketTreeItem[]>([])
  const [rootContainers, setRootContainers] = useState<RootContainer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchTree = useCallback(() => {
    setIsLoading(true)
    getParaTree()
      .then(({ tree }) => {
        const items: BucketTreeItem[] = []
        const roots: RootContainer[] = []
        for (const root of tree) {
          roots.push({ id: root.id as string, type: root.type as ParaType })
          for (const child of root.children) items.push(mapNode(child))
        }
        setBuckets(items)
        setRootContainers(roots)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(
    () => (search.trim() ? filterTree(buckets, search.trim()) : buckets),
    [buckets, search],
  )

  const reset = useCallback(() => {
    setSearch('')
    setSelectedId(null)
    setIsCreating(false)
  }, [])

  const handleCreate = useCallback(async (
    name: string, type: ParaType, parentId: string,
  ): Promise<string> => {
    const created = await createBucket(name, type, parentId)
    fetchTree()
    setSelectedId(created.id)
    setIsCreating(false)
    return created.id
  }, [fetchTree])

  return {
    buckets: filtered,
    allBuckets: buckets,
    rootContainers,
    isLoading,
    search, setSearch,
    selectedId, setSelectedId,
    isCreating, setIsCreating,
    fetchTree, reset, handleCreate,
  }
}
