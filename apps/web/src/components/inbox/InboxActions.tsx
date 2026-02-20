import { Check, FolderOpen, Archive, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { ParaPicker } from '../para/ParaPicker'
import { apiPost, apiDelete } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface InboxActionsProps {
  noteId: string
  suggestedBucketId: string | null
  suggestedBucketPath: string | null
  onActionComplete: () => void
}

export function InboxActions({
  noteId,
  suggestedBucketId,
  suggestedBucketPath,
  onActionComplete,
}: InboxActionsProps) {
  const queryClient = useQueryClient()
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inbox'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['para-tree'] }),
    ])
  }

  const handleConfirm = async () => {
    if (!suggestedBucketId) return
    setLoading(true)
    await apiPost(`/api/inbox/${noteId}/classify`, { bucket_id: suggestedBucketId })
    await invalidateAll()
    setLoading(false)
    onActionComplete()
  }

  const handleSelect = async (bucketId: string) => {
    setLoading(true)
    setShowPicker(false)
    await apiPost(`/api/inbox/${noteId}/classify`, { bucket_id: bucketId })
    await invalidateAll()
    setLoading(false)
    onActionComplete()
  }

  const handleArchive = async () => {
    setLoading(true)
    await apiPost(`/api/inbox/${noteId}/archive`)
    await invalidateAll()
    setLoading(false)
    onActionComplete()
  }

  const handleDelete = async () => {
    setLoading(true)
    await apiDelete(`/api/inbox/${noteId}`)
    await invalidateAll()
    setLoading(false)
    onActionComplete()
  }

  return (
    <div className="flex items-center gap-3 relative">
      {suggestedBucketId && (
        <Button
          variant="primary"
          className="text-sm px-4 py-2 inline-flex items-center gap-2"
          onClick={handleConfirm}
          disabled={loading}
        >
          <Check size={14} />
          Confirm: {suggestedBucketPath ?? 'Suggested'}
        </Button>
      )}
      <div className="relative">
        <Button
          variant="secondary"
          className="text-sm px-4 py-2 inline-flex items-center gap-2"
          onClick={() => setShowPicker(!showPicker)}
          disabled={loading}
        >
          <FolderOpen size={14} />
          {suggestedBucketId ? 'Change' : 'Classify'}
        </Button>
        {showPicker && (
          <ParaPicker onSelect={handleSelect} onClose={() => setShowPicker(false)} />
        )}
      </div>
      <Button
        variant="secondary"
        className="text-sm px-3 py-2 inline-flex items-center gap-2"
        onClick={handleArchive}
        disabled={loading}
      >
        <Archive size={14} />
        Archive
      </Button>
      <Button
        variant="secondary"
        className="text-sm px-3 py-2 inline-flex items-center gap-2 text-red-500"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 size={14} />
        Delete
      </Button>
    </div>
  )
}
