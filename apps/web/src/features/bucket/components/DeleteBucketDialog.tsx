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
  onArchive?: () => void
}

export function DeleteBucketDialog({
  bucketName, noteCount, open, onConfirm, onCancel, onArchive,
}: DeleteBucketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete "{bucketName}"?</DialogTitle>
          <DialogDescription>
            This will permanently delete the bucket and move {noteCount} {noteCount === 1 ? 'note' : 'notes'} back to your inbox.
            {onArchive && ' Consider archiving instead to preserve your notes\u2019 organization.'}
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
          {onArchive && (
            <button
              type="button"
              onClick={onArchive}
              className="rounded-md bg-ember-500 px-4 py-2 text-body-sm text-white transition-colors hover:bg-ember-600"
            >
              Archive instead
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-danger px-4 py-2 text-body-sm text-white transition-colors hover:bg-danger"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
