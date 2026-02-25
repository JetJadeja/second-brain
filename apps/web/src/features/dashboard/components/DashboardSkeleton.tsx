import { SkeletonText } from '@/components/shared/SkeletonText'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-[fade-in_200ms_ease-out]">
      {/* Search bar skeleton */}
      <div className="flex justify-center" style={{ animationDelay: '50ms' }}>
        <SkeletonText width="100%" height={48} rounded="sm" className="max-w-[640px] !rounded-xl" />
      </div>

      {/* Activity feed skeleton */}
      <div style={{ animationDelay: '100ms' }}>
        <SkeletonText width={120} height={12} rounded="sm" />
        <div className="mt-3 space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 h-16 px-4 border-b border-surface-200/50">
              <SkeletonText width={16} height={16} rounded="full" />
              <div className="flex-1 space-y-2">
                <SkeletonText width="60%" height={14} rounded="sm" />
                <SkeletonText width="40%" height={12} rounded="sm" />
              </div>
              <SkeletonText width={24} height={12} rounded="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Space cards skeleton */}
      <div>
        <SkeletonText width={120} height={12} rounded="sm" />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-surface-200/50 min-h-[120px]"
              style={{ animationDelay: `${150 + i * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <SkeletonText width="50%" height={16} rounded="sm" />
                <SkeletonText width={48} height={12} rounded="sm" />
              </div>
              <div className="mt-3 space-y-1.5">
                <SkeletonText width="80%" height={12} rounded="sm" />
                <SkeletonText width="65%" height={12} rounded="sm" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <SkeletonText width={64} height={10} rounded="sm" />
                <SkeletonText width={48} height={10} rounded="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
