import { Info } from 'lucide-react'
import { SOURCE_LABELS } from '@/types/enums'
import { formatFullDateTime } from '@/lib/format-relative-time'
import type { NoteSource } from '@/types/enums'

type SourceMetadataProps = {
  sourceType: NoteSource
  source: Record<string, unknown>
  capturedAt: string
  tags: string[]
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-caption font-medium text-surface-300">{label}</span>
      <div className="text-body-sm text-surface-500">{children}</div>
    </div>
  )
}

export function SourceMetadata({ sourceType, source, capturedAt, tags }: SourceMetadataProps) {
  const domain = typeof source['domain'] === 'string' ? source['domain'] : null
  const author = typeof source['author'] === 'string' ? source['author'] : null
  const url = typeof source['url'] === 'string' ? source['url'] : null

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <Info size={14} className="text-surface-300" />
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300">Source</span>
      </div>

      <div className="space-y-2">
        <MetaRow label="Type">{SOURCE_LABELS[sourceType]}</MetaRow>

        {domain && (
          <MetaRow label="Domain">
            <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="text-ember-500 hover:underline">
              {domain} ↗
            </a>
          </MetaRow>
        )}

        {author && <MetaRow label="Author">{author}</MetaRow>}

        {url && (
          <MetaRow label="Original URL">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-ember-500 hover:underline">
              ↗ Link
            </a>
          </MetaRow>
        )}

        <MetaRow label="Captured">{formatFullDateTime(capturedAt)}</MetaRow>

        {tags.length > 0 && (
          <MetaRow label="Tags">{tags.join(', ')}</MetaRow>
        )}
      </div>
    </div>
  )
}
