import { Inbox, Flag, BarChart3, Link2, CircleDashed, Sparkles } from 'lucide-react'
import { useReview } from '../hooks/useReview'
import { ReviewHeader } from './ReviewHeader'
import { ReviewSectionCard } from './ReviewSectionCard'
import { ProjectCheckSection } from './ProjectCheckSection'
import { AreaBalanceSection } from './AreaBalanceSection'
import { ConnectionSection } from './ConnectionSection'
import { OrphanSection } from './OrphanSection'
import { DistillationSection } from './DistillationSection'

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-20 rounded-xl bg-[var(--surface-200)]" />
      ))}
    </div>
  )
}

export function ReviewView() {
  const review = useReview()

  if (review.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <ReviewHeader lastReviewed={review.lastReviewed} isAllComplete={false} />
        <div className="mt-8"><LoadingSkeleton /></div>
      </div>
    )
  }

  const { data, completion, sectionCounts, isAllComplete, lastReviewed } = review

  if (!data) return null

  return (
    <div className={`mx-auto max-w-2xl px-6 py-8 ${isAllComplete ? 'review-complete' : ''}`}>
      <ReviewHeader lastReviewed={lastReviewed} isAllComplete={isAllComplete} />

      <div className="mt-8 space-y-4">
        <ReviewSectionCard title={`Inbox (${sectionCounts.inbox} items)`} icon={<Inbox />} count={sectionCounts.inbox} isComplete={completion.inbox}>
          {completion.inbox
            ? <p className="text-sm text-[var(--success)]">Inbox clear</p>
            : <p className="text-sm text-[var(--surface-400)]">Process your inbox items from the Inbox page</p>
          }
        </ReviewSectionCard>

        <ReviewSectionCard title="Active Projects" icon={<Flag />} count={sectionCounts.projects} isComplete={completion.projects}>
          <ProjectCheckSection
            projects={data.projects}
            reviewedProjects={review.reviewedProjects}
            onConfirm={review.markProjectReviewed}
            onArchive={review.archiveProject}
          />
        </ReviewSectionCard>

        <ReviewSectionCard title="Area Health" icon={<BarChart3 />} count={sectionCounts.areas} isComplete={completion.areas}>
          <AreaBalanceSection areas={data.areas} />
        </ReviewSectionCard>

        <ReviewSectionCard title="Potential Connections" icon={<Link2 />} count={sectionCounts.connections} isComplete={completion.connections}>
          <ConnectionSection
            suggestions={data.connections}
            dismissedIds={review.dismissedConnections}
            onConnect={(s) => review.connectNotes(s.id, s.note_a.id, s.note_b.id)}
            onDismiss={(s) => review.dismissSuggestion(s.id)}
          />
        </ReviewSectionCard>

        <ReviewSectionCard title="Unconnected Notes" icon={<CircleDashed />} count={sectionCounts.orphans} isComplete={completion.orphans}>
          <OrphanSection
            orphans={data.orphans}
            actedIds={review.actedOrphans}
            onFindConnections={(o) => review.markOrphanActed(o.id)}
            onArchive={(o) => review.archiveOrphan(o.id)}
          />
        </ReviewSectionCard>

        <ReviewSectionCard title="Needs Distilling" icon={<Sparkles />} count={sectionCounts.distillation} isComplete={completion.distillation}>
          <DistillationSection nudges={data.nudges} />
        </ReviewSectionCard>
      </div>
    </div>
  )
}
