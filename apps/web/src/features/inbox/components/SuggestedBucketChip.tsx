import { cn } from '@/lib/utils'

type SuggestedBucketChipProps = {
  bucketName: string | null
  confidence: number | null
}

export function SuggestedBucketChip({ bucketName, confidence }: SuggestedBucketChipProps) {
  const isHigh = (confidence ?? 0) >= 0.7
  const hasName = bucketName !== null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm bg-surface-150 px-1.5 py-1 text-caption text-surface-500',
        isHigh ? 'border border-surface-200' : 'border border-dashed border-surface-200',
        !hasName && 'opacity-40',
        hasName && !isHigh && 'opacity-60',
      )}
    >
      <span
        className="inline-block size-2 shrink-0 rounded-full bg-ember-500"
        aria-hidden="true"
      />
      {hasName ? bucketName : 'Uncategorized'}
    </span>
  )
}
