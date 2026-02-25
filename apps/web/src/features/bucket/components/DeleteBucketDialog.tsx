import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

type DeleteBucketDialogProps = {
  bucketName: string
  noteCount: number
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteBucketDialog({
  bucketName, noteCount, open, onConfirm, onCancel,
}: DeleteBucketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{bucketName}"?</DialogTitle>
          <DialogDescription>
            This will move {noteCount} {noteCount === 1 ? 'note' : 'notes'} back to your inbox. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-body-sm text-surface-400 transition-colors hover:text-surface-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 text-body-sm text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
