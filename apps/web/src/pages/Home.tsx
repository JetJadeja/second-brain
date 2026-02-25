import { Link } from 'react-router-dom'
import { SectionHeader } from '../components/ui/SectionHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { InboxPulse } from '../components/dashboard/InboxPulse'
import { NoteGrid } from '../components/dashboard/NoteGrid'
import { AreaCard } from '../components/dashboard/AreaCard'
import { Button } from '../components/ui/Button'
import { useDashboard } from '../hooks/use-dashboard'
import { useLinkStatus } from '../hooks/use-link-status'

export function Home() {
  const { data, isLoading, error } = useDashboard()
  const { isLinked } = useLinkStatus()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-text-tertiary">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-red-500">Failed to load dashboard</span>
      </div>
    )
  }

  if (!data) return null

  const projects = data.areas.filter((b) => b.type === 'project')
  const areas = data.areas.filter((b) => b.type === 'area')

  return (
    <div className="flex flex-col gap-10">
      <InboxPulse items={data.inbox.recent} totalCount={data.inbox.count} />

      <section>
        <SectionHeader title="Recent & Relevant" />
        {data.recent_and_relevant.length > 0 ? (
          <NoteGrid notes={data.recent_and_relevant} />
        ) : (
          <EmptyState
            message={isLinked
              ? 'No notes yet. Send something to the bot to see it here.'
              : 'Connect your Telegram account to get started.'}
            action={!isLinked ? (
              <Link to="/settings"><Button variant="secondary">Connect</Button></Link>
            ) : undefined}
          />
        )}
      </section>

      {projects.length > 0 && (
        <section>
          <SectionHeader title="Active Projects" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((b) => (
              <AreaCard key={b.id} bucket={b} />
            ))}
          </div>
        </section>
      )}

      {areas.length > 0 && (
        <section>
          <SectionHeader title="Areas at a Glance" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((b) => (
              <AreaCard key={b.id} bucket={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
