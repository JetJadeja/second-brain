import { Check, FolderOpen, Archive, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { ParaPicker } from '../para/ParaPicker'
import { apiPost, apiDelete } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../stores/toast-store'

interface InboxActionsProps {
  noteId: string
  suggestedBucketId: string | null
  suggestedBucketPath: string | null
  confidence: number | null
  onActionComplete: () => void
}

export function InboxActions({
  noteId,
  suggestedBucketId,
  suggestedBucketPath,
  confidence,
  onActionComplete,
}: InboxActionsProps) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const isLowConfidence = confidence !== null && confidence < 0.7

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
    try {
      await apiPost(`/api/inbox/${noteId}/classify`, { bucket_id: suggestedBucketId })
      await invalidateAll()
      addToast(`Note classified to ${suggestedBucketPath ?? 'suggested bucket'}`)
      onActionComplete()
    } catch {
      addToast('Failed to classify note', { label: 'Retry', onClick: handleConfirm })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (bucketId: string) => {
    setLoading(true)
    setShowPicker(false)
    try {
      await apiPost(`/api/inbox/${noteId}/classify`, { bucket_id: bucketId })
      await invalidateAll()
      addToast('Note classified')
      onActionComplete()
    } catch {
      addToast('Failed to classify note')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    setLoading(true)
    try {
      await apiPost(`/api/inbox/${noteId}/archive`)
      await invalidateAll()
      addToast('Note archived')
      onActionComplete()
    } catch {
      addToast('Failed to archive note', { label: 'Retry', onClick: handleArchive })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await apiDelete(`/api/inbox/${noteId}`)
      await invalidateAll()
      addToast('Note deleted')
      onActionComplete()
    } catch {
      addToast('Failed to delete note', { label: 'Retry', onClick: handleDelete })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 relative">
      {suggestedBucketId && (
        <Button
          variant="primary"
          className={`text-sm px-4 py-2 inline-flex items-center gap-2 ${isLowConfidence ? 'opacity-80 border-dashed' : ''}`}
          onClick={handleConfirm}
          disabled={loading}
        >
          <Check size={14} />
          Confirm: {suggestedBucketPath ?? 'Suggested'}
          {isLowConfidence && <span className="text-xs opacity-70">(uncertain)</span>}
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
