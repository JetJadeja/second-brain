import { useState, useEffect } from 'react'
import { Archive, Trash2, Link } from 'lucide-react'
import { cn } from '@/lib/utils'

type NoteActionsProps = {
  onArchive: () => void
  onDelete: () => void
  onCopyLink: () => void
}

function ActionButton({
  icon: Icon, label, onClick, className,
}: {
  icon: typeof Archive
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-7 items-center gap-1.5 rounded-sm px-2 text-body-sm transition-colors duration-75',
        className ?? 'text-surface-400 hover:text-surface-500',
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

export function NoteActions({ onArchive, onDelete, onCopyLink }: NoteActionsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!confirmDelete) return
    const timer = setTimeout(() => setConfirmDelete(false), 3000)
    return () => clearTimeout(timer)
  }, [confirmDelete])

  return (
    <div className="flex items-center gap-1">
      <ActionButton icon={Archive} label="Archive" onClick={onArchive} />
      {confirmDelete ? (
        <button
          type="button"
          onClick={() => { onDelete(); setConfirmDelete(false) }}
          className="flex h-7 items-center gap-1.5 rounded-sm px-2 text-body-sm text-red-500 transition-colors hover:text-red-600"
        >
          <Trash2 size={14} />
          Confirm?
        </button>
      ) : (
        <ActionButton icon={Trash2} label="Delete" onClick={() => setConfirmDelete(true)} className="text-surface-300 hover:text-surface-400" />
      )}
      <ActionButton icon={Link} label="⌘⇧C Copy link" onClick={onCopyLink} className="text-surface-300 hover:text-surface-400" />
    </div>
  )
}
