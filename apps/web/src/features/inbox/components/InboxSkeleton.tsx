import { SkeletonText } from '@/components/shared/SkeletonText'

function SkeletonRow({ delay }: { delay: number }) {
  return (
    <div
      className="flex items-center gap-3 px-2 py-3 opacity-0 animate-in fade-in fill-mode-forwards"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex shrink-0 items-center justify-center pl-1">
        <SkeletonText width={16} height={16} rounded="sm" />
      </div>
      <div className="flex shrink-0 items-center justify-center">
        <SkeletonText width={16} height={16} rounded="full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <SkeletonText width="55%" height={14} />
        <SkeletonText width="35%" height={12} />
        <div className="flex items-center gap-2 pt-0.5">
          <SkeletonText width={90} height={20} />
          <SkeletonText width={30} height={12} />
        </div>
      </div>
    </div>
  )
}

const ROWS = Array.from({ length: 8 }, (_, i) => i)

export function InboxSkeleton() {
  return (
    <div>
      {ROWS.map((i) => (
        <SkeletonRow key={i} delay={i * 30} />
      ))}
    </div>
  )
}
