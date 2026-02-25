import { useState, useCallback } from 'react'
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
import { MoveToModal } from '@/features/inbox/components/MoveToModal'

const SUGGESTION_CHIPS = ['Recent captures', 'Unclassified notes', 'Knowledge gaps']

type MoveTarget = { noteIds: string[]; label: string }

export function DashboardPage() {
  const { data, isLoading, error, classifyNote, skipNote } = useDashboard()
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null)

  const handleMoveTo = useCallback((noteId: string) => {
    const note = data?.inbox.recent.find((n) => n.id === noteId)
    setMoveTarget({ noteIds: [noteId], label: note ? `\u201c${note.title}\u201d` : '1 note' })
  }, [data])

  const handleBatchMove = useCallback((noteIds: string[]) => {
    setMoveTarget({ noteIds, label: `${noteIds.length} ${noteIds.length === 1 ? 'note' : 'notes'}` })
  }, [])

  const handleMoveConfirm = useCallback((bucketId: string) => {
    if (!moveTarget) return
    for (const id of moveTarget.noteIds) void classifyNote(id, bucketId)
    setMoveTarget(null)
  }, [moveTarget, classifyNote])

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
                  onSkip={skipNote}
                  onMoveTo={handleMoveTo}
                  onBatchMove={handleBatchMove}
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

      <MoveToModal
        open={moveTarget !== null}
        label={moveTarget?.label ?? ''}
        onMove={handleMoveConfirm}
        onClose={() => setMoveTarget(null)}
      />

      <TelegramOnboardingModal />
    </>
  )
}
