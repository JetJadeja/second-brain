import { useState, useCallback, useRef, useEffect } from 'react'
import { useToastStore } from '@/stores/toast.store'
import * as noteService from '../services/note-detail.service'
import type { DistillationStatus } from '@/types/enums'

type AnnotationFieldProps = {
  noteId: string
  distillation: string | null
  distillationStatus: DistillationStatus
  onSaved: (text: string | null, status: DistillationStatus) => void
}

export function AnnotationField({
  noteId, distillation, distillationStatus, onSaved,
}: AnnotationFieldProps) {
  const toast = useToastStore((s) => s.toast)
  const [text, setText] = useState(distillation ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isAnnotated = distillationStatus !== 'raw'

  useEffect(() => { setText(distillation ?? '') }, [distillation])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const trimmed = text.trim() || null
      await noteService.updateNote(noteId, {
        distillation: trimmed,
        distillation_status: 'distilled',
      })
      toast({ type: 'success', message: trimmed ? 'Annotation saved' : 'Marked as reviewed' })
      onSaved(trimmed, 'distilled')
    } catch {
      toast({ type: 'error', message: 'Failed to save annotation' })
    } finally {
      setIsSaving(false)
    }
  }, [noteId, text, isSaving, toast, onSaved])

  const handleSkip = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      await noteService.updateNote(noteId, { distillation_status: 'distilled' })
      toast({ type: 'success', message: 'Marked as reviewed' })
      onSaved(null, 'distilled')
    } catch {
      toast({ type: 'error', message: 'Failed to update' })
    } finally {
      setIsSaving(false)
    }
  }, [noteId, isSaving, toast, onSaved])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void handleSave()
    }
  }, [handleSave])

  return (
    <div className="rounded-lg border border-surface-200 bg-surface-50 p-4">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's this about? What would you search to find this later?"
        rows={3}
        className="w-full resize-none bg-transparent text-body text-surface-600 placeholder:text-surface-300 focus:outline-none"
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-md bg-ember-500 px-3 py-1.5 text-body-sm text-white transition-colors hover:bg-ember-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : isAnnotated ? 'Update' : 'Save annotation'}
          </button>
          {!isAnnotated && (
            <button
              type="button"
              onClick={() => void handleSkip()}
              disabled={isSaving}
              className="text-body-sm text-surface-400 transition-colors hover:text-surface-500"
            >
              Skip — I've reviewed this
            </button>
          )}
        </div>
        <span className="text-caption text-surface-300">⌘↵ to save</span>
      </div>
    </div>
  )
}
