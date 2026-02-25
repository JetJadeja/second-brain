import { SkeletonText } from '@/components/shared/SkeletonText'

const FIRST_THRESHOLD = 5

type IndexCardProps = {
  overview: string | null
  description: string | null
  noteCount: number
  isLoading: boolean
}

export function IndexCard({ overview, description, noteCount, isLoading }: IndexCardProps) {
  const hasGenerated = overview !== null

  return (
    <div className="relative rounded-xl border border-surface-200 bg-gradient-to-br from-ember-900/[0.08] to-transparent p-6">
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonText width="80%" height={16} />
          <SkeletonText width="60%" height={16} />
          <SkeletonText width="40%" height={16} />
        </div>
      ) : hasGenerated ? (
        <p className="text-[17px] leading-[1.8] text-surface-500">{overview}</p>
      ) : description ? (
        <p className="text-[17px] leading-[1.8] text-surface-500">{description}</p>
      ) : noteCount > 0 ? (
        <p className="italic text-body text-surface-400">
          Overview generates at {FIRST_THRESHOLD} notes ({noteCount}/{FIRST_THRESHOLD} so far).
        </p>
      ) : (
        <p className="italic text-body text-surface-400">
          No notes yet. Classify notes from your inbox to get started.
        </p>
      )}

      {hasGenerated && (
        <span className="absolute bottom-4 right-6 text-caption text-surface-300">
          <span className="text-ember-500">✦</span> AI-generated
        </span>
      )}
    </div>
  )
}
