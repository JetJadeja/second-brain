import { SkeletonText } from '@/components/shared/SkeletonText'

export function NoteDetailSkeleton() {
  return (
    <div className="flex h-full">
      {/* Center panel */}
      <div className="flex-1 space-y-4 p-6">
        <SkeletonText width="60%" height={24} />
        <div className="flex items-center gap-2">
          <SkeletonText width={14} height={14} rounded="full" />
          <SkeletonText width={60} height={14} />
          <SkeletonText width={80} height={14} />
          <SkeletonText width={100} height={20} />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonText key={i} width={60} height={28} />
          ))}
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonText key={i} width="25%" height={4} />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonText
              key={i}
              width={`${100 - i * 5}%`}
              height={16}
              className="opacity-0 animate-in fade-in fill-mode-forwards"
              // @ts-expect-error -- style prop for animation delay
              style={{ animationDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Context panel */}
      <div className="w-[300px] shrink-0 border-l border-surface-200 bg-surface-100 p-4">
        <div className="space-y-6">
          <div className="space-y-3">
            <SkeletonText width={60} height={10} />
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-1">
                <SkeletonText width="80%" height={13} />
                <SkeletonText width="50%" height={11} />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <SkeletonText width={80} height={10} />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-1">
                <SkeletonText width="70%" height={13} />
                <SkeletonText width={40} height={11} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
