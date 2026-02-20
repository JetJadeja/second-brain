import { useParams } from 'react-router-dom'
import { FolderOpen } from 'lucide-react'
import { useBucket } from '../hooks/use-bucket'
import { BucketHeader } from '../components/bucket/BucketHeader'
import { BucketNoteCard } from '../components/bucket/BucketNoteCard'
import { EmptyState } from '../components/ui/EmptyState'

export default function BucketPage() {
  const { bucketId } = useParams<{ bucketId: string }>()
  const { data, isLoading, error } = useBucket(bucketId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-text-tertiary">Loading...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-red-500">Failed to load bucket</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <BucketHeader bucket={data.bucket} />

      {data.notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.notes.map((note) => (
            <BucketNoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          message="No notes in this bucket yet."
        />
      )}
    </div>
  )
}
