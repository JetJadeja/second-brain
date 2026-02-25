import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import * as bucketService from '../services/bucket.service'
import type { BucketDetail, BucketNote, ChildBucket, SortOption } from '../types/bucket.types'

type BucketStats = { noteCount: number; distilledCount: number; evergreenCount: number }

export function useBucket() {
  const { bucketId } = useParams<{ bucketId: string }>()
  const [bucket, setBucket] = useState<BucketDetail | null>(null)
  const [notes, setNotes] = useState<BucketNote[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortOption>('captured_at')
  const [childBuckets, setChildBuckets] = useState<ChildBucket[]>([])
  const userId = useAuthStore((s) => s.user?.id)

  const fetchBucket = useCallback((pageNum: number, append: boolean) => {
    if (!bucketId) return
    const loading = append ? setIsLoadingMore : setIsLoading
    loading(true)

    bucketService.getBucket(bucketId, pageNum, 20, sort)
      .then((res) => {
        setBucket(res.bucket)
        setNotes((prev) => append ? [...prev, ...res.notes] : res.notes)
        setTotal(res.pagination.total)
        setPage(pageNum)
        loading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load bucket')
        loading(false)
      })
  }, [bucketId, sort])

  useEffect(() => { fetchBucket(1, false) }, [fetchBucket])

  // Fetch child buckets from para tree
  useEffect(() => {
    if (!bucketId) return
    bucketService.getParaTree()
      .then(({ tree }) => {
        const findChildren = (nodes: typeof tree): ChildBucket[] => {
          const children: ChildBucket[] = []
          for (const node of nodes) {
            if (node.parent_id === bucketId) {
              children.push({ id: node.id, name: node.name, type: node.type as ChildBucket['type'], note_count: node.note_count })
            }
            children.push(...findChildren(node.children))
          }
          return children
        }
        setChildBuckets(findChildren(tree))
      })
      .catch(() => { /* silently ignore — child buckets are optional */ })
  }, [bucketId])

  // Realtime
  useEffect(() => {
    if (!userId || !bucketId) return
    const channel = supabase.channel(`bucket-${bucketId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notes',
        filter: `bucket_id=eq.${bucketId}`,
      }, () => fetchBucket(1, false))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, bucketId, fetchBucket])

  const stats = useMemo((): BucketStats => ({
    noteCount: total,
    distilledCount: notes.filter((n) => n.distillation_status === 'distilled').length,
    evergreenCount: notes.filter((n) => n.distillation_status === 'evergreen').length,
  }), [total, notes])

  const loadMore = useCallback(() => {
    if (isLoadingMore || notes.length >= total) return
    fetchBucket(page + 1, true)
  }, [isLoadingMore, notes.length, total, page, fetchBucket])

  const changeSort = useCallback((newSort: SortOption) => {
    setSort(newSort)
    setNotes([])
    setPage(1)
  }, [])

  return {
    bucket, notes, total, isLoading, isLoadingMore, error,
    stats, childBuckets, sort, changeSort, loadMore, setBucket,
  }
}
