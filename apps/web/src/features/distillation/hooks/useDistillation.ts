import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToastStore } from '@/stores/toast.store'
import { getNote, updateNote } from '@/features/note-detail/services/note-detail.service'
import { distillationService } from '../services/distillation.service'
import { computeTarget, parseBullets } from '../lib/distillation-helpers'
import type { NoteDetail } from '@/features/note-detail/types/note-detail.types'
import type { Highlight, DistillAction } from '../types/distillation.types'

export function useDistillation() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.toast)

  const [note, setNote] = useState<NoteDetail | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [bullets, setBullets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingAction, setLoadingAction] = useState<DistillAction | null>(null)
  const [showDiscard, setShowDiscard] = useState(false)
  const undoStack = useRef<string[][]>([])
  const initialBullets = useRef<string[]>([])

  const isDirty = JSON.stringify(bullets) !== JSON.stringify(initialBullets.current)
  const canUndo = undoStack.current.length > 0
  const targetStage = note ? computeTarget(note.distillation_status) : 'key_points'

  useEffect(() => {
    if (!noteId) return
    setIsLoading(true)
    Promise.all([getNote(noteId), distillationService.getHighlights(noteId)])
      .then(([res, hl]) => {
        setNote(res.note)
        setHighlights(hl)
        const parsed = parseBullets(res.note)
        setBullets(parsed)
        initialBullets.current = parsed
      })
      .catch(() => toast({ message: 'Failed to load note', type: 'error' }))
      .finally(() => setIsLoading(false))
  }, [noteId, toast])

  const addBullet = useCallback((text: string, index?: number) => {
    setBullets((prev) => {
      const next = [...prev]
      next.splice(index ?? prev.length, 0, text)
      return next
    })
  }, [])

  const updateBullet = useCallback((index: number, text: string) => {
    setBullets((prev) => prev.map((b, i) => (i === index ? text : b)))
  }, [])

  const removeBullet = useCallback((index: number) => {
    setBullets((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const undo = useCallback(() => {
    const prev = undoStack.current.pop()
    if (prev) setBullets(prev)
  }, [])

  const aiAssist = useCallback(async (action: DistillAction) => {
    if (!noteId || loadingAction) return
    setLoadingAction(action)
    undoStack.current.push([...bullets])
    try {
      const res = await distillationService.distillAssist(noteId, action)
      setBullets(res.text.split('\n').filter(Boolean))
    } catch {
      undoStack.current.pop()
      toast({ message: 'AI generation failed — please retry', type: 'error' })
    } finally {
      setLoadingAction(null)
    }
  }, [noteId, loadingAction, bullets, toast])

  const save = useCallback(async () => {
    if (!noteId || isSaving || bullets.length === 0) return
    setIsSaving(true)
    try {
      const data: Record<string, unknown> = {
        key_points: bullets,
        distillation_status: targetStage,
      }
      if (bullets.length === 1 && !bullets[0]?.startsWith('•')) {
        data['distillation'] = bullets[0]
      }
      await updateNote(noteId, data)
      initialBullets.current = [...bullets]
      toast({ message: 'Distillation saved', type: 'success' })
      navigate(`/notes/${noteId}`)
    } catch {
      toast({ message: 'Save failed — please retry', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }, [noteId, isSaving, bullets, targetStage, toast, navigate])

  const tryExit = useCallback(() => {
    if (isDirty) { setShowDiscard(true); return }
    navigate(`/notes/${noteId}`)
  }, [isDirty, navigate, noteId])

  const confirmDiscard = useCallback(() => {
    setShowDiscard(false)
    navigate(`/notes/${noteId}`)
  }, [navigate, noteId])

  const cancelDiscard = useCallback(() => setShowDiscard(false), [])

  return {
    note, highlights, bullets, isLoading, isSaving, isDirty, canUndo,
    targetStage, loadingAction, showDiscard,
    addBullet, updateBullet, removeBullet, setBullets, undo, aiAssist, save,
    tryExit, confirmDiscard, cancelDiscard,
  }
}
