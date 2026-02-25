import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import type { RelatedNote } from '../types/note-detail.types'

type BacklinksListProps = {
  backlinks: RelatedNote[]
}

const MAX_VISIBLE = 8

export function BacklinksList({ backlinks }: BacklinksListProps) {
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? backlinks : backlinks.slice(0, MAX_VISIBLE)

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <Link2 size={14} className="text-surface-300" />
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300">Linked from</span>
      </div>

      {backlinks.length === 0 ? (
        <p className="text-caption text-surface-300">No backlinks yet</p>
      ) : (
        <div className="space-y-3">
          {visible.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => navigate(`/notes/${link.id}`)}
              className="flex w-full flex-col items-start rounded-sm text-left transition-colors duration-75 hover:bg-surface-150"
            >
              <p className="truncate text-body-sm font-medium text-surface-600">{link.title}</p>
              <span className={link.type === 'explicit' ? 'text-caption text-ember-500' : 'text-caption text-surface-300'}>
                {link.type === 'explicit' ? 'Explicit link' : 'AI detected'}
              </span>
              {link.context && (
                <p className="truncate text-caption italic text-surface-400">{link.context}</p>
              )}
            </button>
          ))}

          {backlinks.length > MAX_VISIBLE && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-body-sm text-ember-500 hover:underline"
            >
              Show all ({backlinks.length}) ↓
            </button>
          )}
        </div>
      )}
    </div>
  )
}
