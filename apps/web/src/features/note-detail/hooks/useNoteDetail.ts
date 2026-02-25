import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToastStore } from '@/stores/toast.store'
import * as noteService from '../services/note-detail.service'
import type { NoteDetail, RelatedNote } from '../types/note-detail.types'

export function useNoteDetail() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.toast)
  const [note, setNote] = useState<NoteDetail | null>(null)
  const [relatedNotes, setRelatedNotes] = useState<RelatedNote[]>([])
  const [backlinks, setBacklinks] = useState<RelatedNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!noteId) return
    setIsLoading(true)
    noteService.getNote(noteId)
      .then((res) => {
        setNote(res.note)
        setRelatedNotes(res.related_notes)
        setBacklinks(res.backlinks)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load note')
        setIsLoading(false)
      })
  }, [noteId])

  const archive = useCallback(async () => {
    if (!noteId) return
    try {
      await noteService.archiveNote(noteId)
      toast({ type: 'success', message: 'Archived' })
      navigate(-1)
    } catch {
      toast({ type: 'error', message: 'Failed to archive' })
    }
  }, [noteId, navigate, toast])

  const deleteNote = useCallback(async () => {
    if (!noteId) return
    try {
      await noteService.deleteNote(noteId)
      toast({ type: 'success', message: 'Note deleted' })
      navigate(-1)
    } catch {
      toast({ type: 'error', message: 'Failed to delete' })
    }
  }, [noteId, navigate, toast])

  const copyLink = useCallback(() => {
    void navigator.clipboard.writeText(`${window.location.origin}/notes/${noteId ?? ''}`)
    toast({ type: 'success', message: 'Link copied' })
  }, [noteId, toast])

  return { note, relatedNotes, backlinks, isLoading, error, archive, deleteNote, copyLink }
}
