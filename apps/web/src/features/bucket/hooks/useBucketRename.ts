import { useState, useCallback } from 'react'
import { useToastStore } from '@/stores/toast.store'
import * as bucketService from '../services/bucket.service'
import type { BucketDetail } from '../types/bucket.types'

type UseBucketRenameOptions = {
  bucket: BucketDetail | null
  onRenamed: (updated: BucketDetail) => void
}

export function useBucketRename({ bucket, onRenamed }: UseBucketRenameOptions) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [editName, setEditName] = useState('')
  const toast = useToastStore((s) => s.toast)

  const startRename = useCallback(() => {
    if (!bucket) return
    setEditName(bucket.name)
    setIsRenaming(true)
  }, [bucket])

  const cancelRename = useCallback(() => {
    setIsRenaming(false)
    setEditName('')
  }, [])

  const submitRename = useCallback(async () => {
    if (!bucket || !editName.trim() || editName.trim() === bucket.name) {
      cancelRename()
      return
    }

    const previousName = bucket.name
    const newName = editName.trim()

    // Optimistic update
    onRenamed({ ...bucket, name: newName })
    setIsRenaming(false)

    try {
      await bucketService.renameBucket(bucket.id, newName)
      toast({ type: 'success', message: 'Bucket renamed' })
    } catch {
      onRenamed({ ...bucket, name: previousName })
      toast({ type: 'error', message: 'Failed to rename bucket' })
    }
  }, [bucket, editName, cancelRename, onRenamed, toast])

  return { isRenaming, editName, setEditName, startRename, cancelRename, submitRename }
}
