import { SkeletonText } from '@/components/shared/SkeletonText'

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-lg border border-surface-200 bg-surface-100 p-4 opacity-0 animate-in fade-in fill-mode-forwards"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <SkeletonText width={14} height={14} rounded="full" />
        <SkeletonText width="60%" height={14} />
      </div>
      <div className="space-y-2">
        <SkeletonText width="90%" height={12} />
        <SkeletonText width="70%" height={12} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <SkeletonText width={6} height={6} rounded="full" />
        <SkeletonText width={32} height={12} />
      </div>
    </div>
  )
}

const CARDS = Array.from({ length: 6 }, (_, i) => i)

export function BucketSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <SkeletonText width={8} height={8} rounded="full" />
          <SkeletonText width={200} height={24} />
        </div>
        <SkeletonText width={60} height={12} />
        <SkeletonText width={240} height={14} />
      </div>

      {/* Index Card skeleton */}
      <div className="rounded-xl border border-surface-200 p-6">
        <div className="space-y-3">
          <SkeletonText width="80%" height={16} />
          <SkeletonText width="60%" height={16} />
          <SkeletonText width="40%" height={16} />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {CARDS.map((i) => (
          <SkeletonCard key={i} delay={i * 50} />
        ))}
      </div>
    </div>
  )
}
