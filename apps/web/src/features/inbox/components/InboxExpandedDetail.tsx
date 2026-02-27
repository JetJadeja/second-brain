import type { InboxNoteItem } from '../types/inbox.types'

type InboxExpandedDetailProps = {
  item: InboxNoteItem
}

export function InboxExpandedDetail({ item }: InboxExpandedDetailProps) {
  return (
    <div className="border-t border-surface-200 bg-surface-100 py-3 pl-[60px] pr-4">
      {item.ai_summary && (
        <p className="text-body-sm leading-relaxed text-surface-500">{item.ai_summary}</p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-surface-150 px-2 py-0.5 text-caption text-surface-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
