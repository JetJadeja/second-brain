import { FolderInput, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FeedBatchBarProps = {
  count: number
  onMoveTo: () => void
  onClear: () => void
}

export function FeedBatchBar({ count, onMoveTo, onClear }: FeedBatchBarProps) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-100 px-3 py-2 mt-2">
      <span className="text-body-sm text-surface-500">
        {count} {count === 1 ? 'note' : 'notes'} selected
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button type="button" variant="ghost" size="xs" onClick={onClear}>
          <X size={12} />
          Clear
        </Button>
        <Button type="button" size="xs" onClick={onMoveTo}>
          <FolderInput size={12} />
          Move to...
        </Button>
      </div>
    </div>
  )
}
