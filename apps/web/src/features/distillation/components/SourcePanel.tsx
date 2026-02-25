import { useRef, useMemo } from 'react'
import type { NoteDetail } from '@/features/note-detail/types/note-detail.types'
import type { Highlight } from '../types/distillation.types'
import { HighlightedPassage } from './HighlightedPassage'
import { SelectionToolbar } from './SelectionToolbar'

type SourcePanelProps = {
  note: NoteDetail
  highlights: Highlight[]
  onAddBullet: (text: string) => void
}

export function SourcePanel({ note, highlights, onAddBullet }: SourcePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const content = note.original_content

  if (!content) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-body text-surface-400">No original content available</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto p-6">
      <SelectionToolbar
        containerRef={containerRef}
        onHighlight={() => {}}
        onAdd={onAddBullet}
      />
      <HighlightedContent content={content} highlights={highlights} onAdd={onAddBullet} />
    </div>
  )
}

type HighlightedContentProps = {
  content: string
  highlights: Highlight[]
  onAdd: (text: string) => void
}

function HighlightedContent({ content, highlights, onAdd }: HighlightedContentProps) {
  const segments = useMemo(() => buildSegments(content, highlights), [content, highlights])

  return (
    <div className="whitespace-pre-wrap text-[17px] leading-[1.7] text-surface-600">
      {segments.map((seg, i) =>
        seg.highlight ? (
          <HighlightedPassage
            key={i}
            text={seg.text}
            reason={seg.highlight.reason}
            onAddToDistillation={onAdd}
          />
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  )
}

type Segment = { text: string; highlight: Highlight | null }

function buildSegments(content: string, highlights: Highlight[]): Segment[] {
  if (highlights.length === 0) return [{ text: content, highlight: null }]

  const sorted = [...highlights].sort((a, b) => a.start - b.start)
  const segments: Segment[] = []
  let cursor = 0

  for (const hl of sorted) {
    const start = Math.max(hl.start, cursor)
    const end = Math.min(hl.end, content.length)
    if (start >= end) continue

    if (cursor < start) {
      segments.push({ text: content.slice(cursor, start), highlight: null })
    }
    segments.push({ text: content.slice(start, end), highlight: hl })
    cursor = end
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), highlight: null })
  }

  return segments
}
