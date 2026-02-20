import { useParams } from 'react-router-dom'

export default function BucketPage() {
  const { bucketId } = useParams<{ bucketId: string }>()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-text-primary">Bucket</h1>
      <p className="text-sm text-text-tertiary">Bucket ID: {bucketId}</p>
    </div>
  )
}
