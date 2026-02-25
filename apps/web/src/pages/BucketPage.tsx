import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '@/stores/toast.store'
import { useBucket } from '@/features/bucket/hooks/useBucket'
import { useBucketRename } from '@/features/bucket/hooks/useBucketRename'
import * as bucketService from '@/features/bucket/services/bucket.service'
import { BucketHeader } from '@/features/bucket/components/BucketHeader'
import { BucketStats } from '@/features/bucket/components/BucketStats'
import { IndexCard } from '@/features/bucket/components/IndexCard'
import { GridControls } from '@/features/bucket/components/GridControls'
import { NoteGrid } from '@/features/bucket/components/NoteGrid'
import { BucketEmptyState } from '@/features/bucket/components/BucketEmptyState'
import { BucketSkeleton } from '@/features/bucket/components/BucketSkeleton'
import { DeleteBucketDialog } from '@/features/bucket/components/DeleteBucketDialog'

export function BucketPage() {
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.toast)
  const bucket = useBucket()
  const rename = useBucketRename({
    bucket: bucket.bucket,
    onRenamed: (updated) => bucket.setBucket(updated),
  })

  const [graphView, setGraphView] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!bucket.bucket) return
    setDeleteOpen(false)
    try {
      await bucketService.deleteBucket(bucket.bucket.id)
      toast({ type: 'success', message: 'Bucket deleted' })
      navigate('/home')
    } catch {
      toast({ type: 'error', message: 'Failed to delete bucket' })
    }
  }, [bucket.bucket, navigate, toast])

  if (bucket.isLoading) return <BucketSkeleton />

  if (bucket.error || !bucket.bucket) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-body text-surface-500">{bucket.error ?? 'Bucket not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-body-sm text-ember-500 hover:underline"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      <BucketHeader
        bucket={bucket.bucket}
        isRenaming={rename.isRenaming}
        editName={rename.editName}
        onEditName={rename.setEditName}
        onStartRename={rename.startRename}
        onCancelRename={rename.cancelRename}
        onSubmitRename={rename.submitRename}
        onDelete={() => setDeleteOpen(true)}
      />

      <BucketStats
        type={bucket.bucket.type}
        stats={bucket.stats}
        childBuckets={bucket.childBuckets}
      />

      <div className="mt-4">
        <IndexCard
          overview={bucket.bucket.overview}
          description={bucket.bucket.description}
          noteCount={bucket.total}
          isLoading={false}
        />
      </div>

      <div className="mt-6">
        <GridControls
          bucketName={bucket.bucket.name}
          sort={bucket.sort}
          onSortChange={bucket.changeSort}
          graphView={graphView}
          onToggleGraph={() => setGraphView((v) => !v)}
        />
      </div>

      <div className="mt-4 flex-1">
        {bucket.notes.length === 0 && bucket.childBuckets.length === 0 ? (
          <BucketEmptyState />
        ) : (
          <NoteGrid
            notes={bucket.notes}
            isLoadingMore={bucket.isLoadingMore}
            onLoadMore={bucket.loadMore}
          />
        )}
      </div>

      <DeleteBucketDialog
        bucketName={bucket.bucket.name}
        noteCount={bucket.total}
        open={deleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
