import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { apiDelete } from '../../lib/api-client'

interface BucketActionsProps {
  bucketId: string
  bucketName: string
  noteCount: number
  onRename: (newName: string) => void
}

export function BucketActions({ bucketId, bucketName, noteCount, onRename }: BucketActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  async function handleDelete() {
    await apiDelete(`/api/para/buckets/${bucketId}`)
    await queryClient.invalidateQueries({ queryKey: ['para-tree'] })
    navigate('/dashboard')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-hover"
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
          <button
            type="button"
            onClick={() => { setMenuOpen(false); onRename(bucketName) }}
            className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-hover flex items-center gap-2"
          >
            <Pencil size={12} />
            Rename
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-hover flex items-center gap-2"
            >
              <Trash2 size={12} />
              Delete
            </button>
          ) : (
            <div className="px-3 py-1.5 text-sm">
              <p className="text-text-secondary mb-1">
                {noteCount > 0 ? `${noteCount} notes will move to inbox.` : 'No notes affected.'}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={handleDelete} className="text-red-500 font-medium hover:underline">Confirm</button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-text-tertiary hover:text-text-primary">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
