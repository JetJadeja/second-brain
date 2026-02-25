import { Sparkles } from 'lucide-react'
import type { BatchCluster } from '../types/inbox.types'

type SmartBatchBannerProps = {
  cluster: BatchCluster | null
  onConfirm: () => void
  onDismiss: () => void
}

export function SmartBatchBanner({ cluster, onConfirm, onDismiss }: SmartBatchBannerProps) {
  if (!cluster) return null

  return (
    <div className="flex items-center gap-3 rounded-md border-l-[3px] border-l-ember-500 bg-surface-100 px-4 py-3">
      <Sparkles size={16} className="shrink-0 text-ember-500" />
      <p className="flex-1 text-body text-surface-500">
        {cluster.count} items look like they belong in{' '}
        <span className="font-medium text-surface-700">{cluster.bucketPath}</span>.
        {' '}Confirm all?
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-sm bg-ember-500 px-3 py-1 text-body-sm text-white transition-colors hover:bg-ember-600"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1 text-body-sm text-surface-400 transition-colors hover:text-surface-500"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
