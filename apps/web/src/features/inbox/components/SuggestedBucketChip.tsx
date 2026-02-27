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
        'inline-flex max-w-[200px] items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] text-surface-500',
        isHigh ? 'bg-surface-150' : 'bg-surface-150/60',
        !hasName && 'opacity-40',
        hasName && !isHigh && 'opacity-60',
      )}
    >
      <span
        className="inline-block size-1.5 shrink-0 rounded-full bg-ember-500"
        aria-hidden="true"
      />
      <span className="truncate">{hasName ? bucketName : 'Uncategorized'}</span>
    </span>
  )
}
