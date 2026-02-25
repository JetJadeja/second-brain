import { SkeletonText } from '@/components/shared/SkeletonText'

function SkeletonRow({ delay }: { delay: number }) {
  return (
    <div
      className="flex h-14 items-center opacity-0 animate-in fade-in fill-mode-forwards"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex w-10 shrink-0 items-center justify-center">
        <SkeletonText width={16} height={16} rounded="sm" />
      </div>
      <div className="flex w-8 shrink-0 items-center justify-center">
        <SkeletonText width={16} height={16} rounded="full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-4">
        <SkeletonText width="60%" height={14} />
        <SkeletonText width="40%" height={12} />
      </div>
      <div className="w-40 shrink-0 px-2">
        <SkeletonText width={100} height={22} />
      </div>
      <div className="w-20 shrink-0">
        <SkeletonText width={40} height={12} className="ml-auto" />
      </div>
      <div className="flex w-20 shrink-0 items-center justify-center">
        <SkeletonText width={28} height={28} rounded="full" />
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
