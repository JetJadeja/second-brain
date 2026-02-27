import { useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BucketPickerTree } from './BucketPickerTree'
import { CreateBucketForm } from './CreateBucketForm'
import { useBucketPicker } from '../hooks/useBucketPicker'

type MoveToModalProps = {
  open: boolean
  label: string
  onMove: (bucketId: string) => void
  onClose: () => void
}

export function MoveToModal({ open, label, onMove, onClose }: MoveToModalProps) {
  const picker = useBucketPicker()

  useEffect(() => {
    if (open) { picker.fetchTree(); picker.reset() }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleMove(): void {
    if (!picker.selectedId) return
    onMove(picker.selectedId)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="flex max-h-[70vh] flex-col gap-0 bg-surface-50 p-0 sm:max-w-md">
        <DialogHeader className="border-b border-surface-200 px-4 py-3">
          <DialogTitle className="font-title-sm text-surface-700">
            Move {label}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative border-b border-surface-200 px-4 py-2">
          <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-surface-300" />
          <input
            type="text"
            value={picker.search}
            onChange={(e) => picker.setSearch(e.target.value)}
            placeholder="Search buckets..."
            className="h-8 w-full rounded-sm bg-surface-100 pl-7 pr-3 text-body-sm text-surface-600 placeholder:text-surface-300 outline-none"
          />
        </div>

        {/* Tree or Create form */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {picker.isLoading ? (
            <div className="py-8 text-center text-body-sm text-surface-400">Loading...</div>
          ) : picker.isCreating ? (
            <CreateBucketForm
              rootContainers={picker.rootContainers}
              onSubmit={picker.handleCreate}
              onCancel={() => picker.setIsCreating(false)}
            />
          ) : picker.buckets.length === 0 ? (
            <div className="py-8 text-center text-body-sm text-surface-400">No buckets found</div>
          ) : (
            <BucketPickerTree
              buckets={picker.buckets}
              selectedId={picker.selectedId}
              onSelect={picker.setSelectedId}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-surface-200 px-4 py-3">
          {!picker.isCreating && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => picker.setIsCreating(true)}
              className="mr-auto"
            >
              <Plus size={14} />
              New bucket
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            size="sm"
            disabled={!picker.selectedId || picker.isCreating}
            onClick={handleMove}
          >
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
