import { FolderOpen } from 'lucide-react'

export function BucketEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <FolderOpen size={32} className="text-surface-300" />
      <p className="text-body text-surface-500">No notes yet</p>
      <p className="text-body-sm text-surface-300">
        Classify notes from your inbox or send new content via Telegram.
      </p>
    </div>
  )
}
