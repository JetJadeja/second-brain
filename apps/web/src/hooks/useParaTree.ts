import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { getParaTree } from '@/features/bucket/services/bucket.service'
import type { BucketTreeItem } from '@/components/layout/types'
import type { ParaType } from '@/types/enums'

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

/**
 * Fetches the PARA tree and flattens root containers into their children.
 * The API returns root nodes (Projects, Areas, Resources, Archive) which
 * are just containers — the sidebar groups by paraType itself, so we
 * surface the children directly with their parent's type.
 */
export function useParaTree() {
  const [buckets, setBuckets] = useState<BucketTreeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const userId = useAuthStore((s) => s.user?.id)

  const fetch = useCallback(() => {
    getParaTree()
      .then(({ tree }) => {
        const items: BucketTreeItem[] = []
        for (const root of tree) {
          for (const child of root.children) {
            items.push(mapNode(child))
          }
        }
        setBuckets(items)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel('sidebar-para-tree')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'para_buckets',
        filter: `user_id=eq.${userId}`,
      }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, fetch])

  return { buckets, isLoading, refetch: fetch }
}
