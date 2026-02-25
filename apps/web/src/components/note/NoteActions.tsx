import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderInput, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { apiPatch, apiDelete } from '../../lib/api-client'
import { ParaPicker } from '../para/ParaPicker'
import { useToastStore } from '../../stores/toast-store'

interface NoteActionsProps {
  noteId: string
  currentBucketId: string | null
}

export function NoteActions({ noteId, currentBucketId }: NoteActionsProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  async function handleMove(bucketId: string) {
    if (bucketId === currentBucketId) return
    setLoading(true)
    try {
      await apiPatch(`/api/notes/${noteId}`, { bucket_id: bucketId })
      setShowPicker(false)
      await queryClient.invalidateQueries({ queryKey: ['note', noteId] })
      await queryClient.invalidateQueries({ queryKey: ['para-tree'] })
      addToast('Note moved')
    } catch {
      addToast('Failed to move note')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await apiDelete(`/api/notes/${noteId}`)
      addToast('Note deleted')
      navigate('/dashboard')
    } catch {
      addToast('Failed to delete note')
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
      >
        <FolderInput size={12} />
        Move
      </button>

      {!confirmDelete ? (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="text-xs text-text-tertiary hover:text-red-500 flex items-center gap-1"
        >
          <Trash2 size={12} />
          Delete
        </button>
      ) : (
        <span className="text-xs flex items-center gap-1">
          <span className="text-red-500">Delete?</span>
          <button type="button" onClick={handleDelete} className="text-red-500 font-medium hover:underline">Yes</button>
          <button type="button" onClick={() => setConfirmDelete(false)} className="text-text-tertiary hover:text-text-primary">No</button>
        </span>
      )}

      {showPicker && (
        <ParaPicker
          onSelect={(bucketId) => handleMove(bucketId)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
