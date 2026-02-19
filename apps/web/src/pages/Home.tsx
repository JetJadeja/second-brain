import { SectionHeader } from '../components/ui/SectionHeader'
import { InboxPulse } from '../components/dashboard/InboxPulse'
import { NoteGrid } from '../components/dashboard/NoteGrid'
import { AreaCard } from '../components/dashboard/AreaCard'
import { recentNotes, paraBuckets } from '../lib/mock-data'

export default function Home() {
  const projects = paraBuckets.filter((b) => b.type === 'project')
  const areas = paraBuckets.filter((b) => b.type === 'area')

  return (
    <div className="flex flex-col gap-10">
      <InboxPulse />

      <section>
        <SectionHeader title="Recent & Relevant" />
        <NoteGrid notes={recentNotes} />
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
