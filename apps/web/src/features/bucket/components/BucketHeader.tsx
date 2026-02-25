import { useEffect, useRef } from 'react'
import { MoreHorizontal, Pencil, ArrowRight, Trash2 } from 'lucide-react'
import { ParaDot } from '@/components/shared/ParaDot'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BucketDetail } from '../types/bucket.types'

type BucketHeaderProps = {
  bucket: BucketDetail
  isRenaming: boolean
  editName: string
  onEditName: (name: string) => void
  onStartRename: () => void
  onCancelRename: () => void
  onSubmitRename: () => void
  onDelete: () => void
}

export function BucketHeader({
  bucket, isRenaming, editName, onEditName,
  onStartRename, onCancelRename, onSubmitRename, onDelete,
}: BucketHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSubmitRename()
    if (e.key === 'Escape') onCancelRename()
  }

  return (
    <div className="flex items-center gap-3">
      <ParaDot type={bucket.type} size={8} />

      {isRenaming ? (
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => onEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={onSubmitRename}
          maxLength={40}
          className="flex-1 border-b-2 border-ember-500 bg-transparent text-title-lg text-surface-700 outline-none"
        />
      ) : (
        <h1 className="flex-1 truncate text-title-lg text-surface-700">{bucket.name}</h1>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="shrink-0 text-surface-400 hover:text-surface-500">
            <MoreHorizontal size={24} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onStartRename}>
            <Pencil size={14} className="mr-2" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowRight size={14} className="mr-2" /> Move to…
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500" onClick={onDelete}>
            <Trash2 size={14} className="mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
