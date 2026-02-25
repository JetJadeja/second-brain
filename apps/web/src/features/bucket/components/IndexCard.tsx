import { SkeletonText } from '@/components/shared/SkeletonText'

type IndexCardProps = {
  summary: string | null
  isLoading: boolean
}

export function IndexCard({ summary, isLoading }: IndexCardProps) {
  return (
    <div className="relative rounded-xl border border-surface-200 bg-gradient-to-br from-ember-900/[0.08] to-transparent p-6">
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonText width="80%" height={16} />
          <SkeletonText width="60%" height={16} />
          <SkeletonText width="40%" height={16} />
        </div>
      ) : summary ? (
        <p className="text-[17px] leading-[1.8] text-surface-500">{summary}</p>
      ) : (
        <p className="italic text-body text-surface-400">
          No notes in this bucket yet. Notes classified here will generate an AI overview.
        </p>
      )}

      <span className="absolute bottom-4 right-6 text-caption text-surface-300">
        <span className="text-ember-500">✦</span> AI-generated
      </span>
    </div>
  )
}
