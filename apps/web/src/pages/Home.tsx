import { SectionHeader } from '../components/ui/SectionHeader'
import { InboxPulse } from '../components/dashboard/InboxPulse'
import { NoteGrid } from '../components/dashboard/NoteGrid'
import { AreaCard } from '../components/dashboard/AreaCard'
import type { DashboardArea, DashboardNote, DashboardInboxItem } from '../lib/types'

const emptyAreas: DashboardArea[] = []
const emptyNotes: DashboardNote[] = []
const emptyInbox: DashboardInboxItem[] = []

export default function Home() {
  const projects = emptyAreas.filter((b) => b.type === 'project')
  const areas = emptyAreas.filter((b) => b.type === 'area')

  return (
    <div className="flex flex-col gap-10">
      <InboxPulse items={emptyInbox} />

      <section>
        <SectionHeader title="Recent & Relevant" />
        <NoteGrid notes={emptyNotes} />
      </section>

      <section>
        <SectionHeader title="Active Projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((b) => (
            <AreaCard key={b.id} bucket={b} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Areas at a Glance" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((b) => (
            <AreaCard key={b.id} bucket={b} />
          ))}
        </div>
      </section>
    </div>
  )
}
