import { Clock, FolderOpen } from 'lucide-react'
import { TelegramOnboardingModal } from '@/features/telegram'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { DashboardSearchBar } from '@/features/dashboard/components/DashboardSearchBar'
import { DashboardSuggestionChips } from '@/features/dashboard/components/DashboardSuggestionChips'
import { DashboardSectionHeader } from '@/features/dashboard/components/DashboardSectionHeader'
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed'
import { DashboardEmptyState } from '@/features/dashboard/components/DashboardEmptyState'
import { SpaceCardGrid } from '@/features/dashboard/components/SpaceCardGrid'
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton'

const SUGGESTION_CHIPS = ['Recent captures', 'Unclassified notes', 'Knowledge gaps']

export function DashboardPage() {
  const { data, isLoading, error, classifyNote } = useDashboard()

  const isEmpty = data && data.inbox.count === 0 && data.recent_and_relevant.length === 0
  const hasActivity = data && (data.inbox.recent.length > 0 || data.recent_and_relevant.length > 0)

  return (
    <>
      <div className="space-y-8 animate-page-enter">
        {isLoading && <DashboardSkeleton />}

        {error && (
          <div className="text-center py-12">
            <p className="font-body text-danger">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Search zone */}
            <div>
              <DashboardSearchBar />
              <DashboardSuggestionChips chips={SUGGESTION_CHIPS} />
            </div>

            {/* Activity feed zone */}
            <div>
              <DashboardSectionHeader icon={Clock} label="Recent activity" />
              {isEmpty && <DashboardEmptyState />}
              {hasActivity && (
                <ActivityFeed
                  inboxItems={data.inbox.recent}
                  recentItems={data.recent_and_relevant}
                  onClassify={classifyNote}
                />
              )}
            </div>

            {/* Spaces zone */}
            {data.areas.length > 0 && (
              <div>
                <DashboardSectionHeader icon={FolderOpen} label="Your knowledge" />
                <SpaceCardGrid areas={data.areas} />
              </div>
            )}
          </>
        )}
      </div>

      <TelegramOnboardingModal />
    </>
  )
}
