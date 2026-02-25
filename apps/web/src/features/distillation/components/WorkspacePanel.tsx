import type { NoteDetail } from '@/features/note-detail/types/note-detail.types'
import type { DistillAction, DistillTarget } from '../types/distillation.types'
import { BulletEditor } from './BulletEditor'
import { AiAssistActions } from './AiAssistActions'
import { DiscardPrompt } from './DiscardPrompt'

type WorkspacePanelProps = {
  note: NoteDetail
  bullets: string[]
  targetStage: DistillTarget
  isDirty: boolean
  isSaving: boolean
  canUndo: boolean
  loadingAction: DistillAction | null
  showDiscard: boolean
  onUpdate: (index: number, text: string) => void
  onAdd: (text: string, index?: number) => void
  onRemove: (index: number) => void
  onAiAssist: (action: DistillAction) => void
  onUndo: () => void
  onSave: () => void
  onExit: () => void
  onConfirmDiscard: () => void
  onCancelDiscard: () => void
}

export function WorkspacePanel({
  note, bullets, targetStage, isDirty, isSaving, canUndo, loadingAction,
  showDiscard, onUpdate, onAdd, onRemove, onAiAssist, onUndo, onSave,
  onExit, onConfirmDiscard, onCancelDiscard,
}: WorkspacePanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-surface-200 p-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-title-sm text-surface-700">
            Distill: {note.title}
          </h2>
          <p className="mt-1 text-caption text-surface-400">
            Working on: {formatStage(targetStage)}
          </p>
        </div>
        <button
          onClick={onExit}
          className="ml-3 text-[20px] leading-none text-surface-300 transition-colors hover:text-surface-400"
        >
          ×
        </button>
      </div>

      {/* Discard prompt */}
      {showDiscard && (
        <div className="p-4 pb-0">
          <DiscardPrompt onDiscard={onConfirmDiscard} onKeepEditing={onCancelDiscard} />
        </div>
      )}

      {/* Undo */}
      {canUndo && (
        <div className="flex justify-end px-4 pt-3">
          <button onClick={onUndo} className="text-body-sm text-ember-500 hover:underline">
            ↩ Undo
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 p-4">
        <BulletEditor bullets={bullets} onUpdate={onUpdate} onAdd={onAdd} onRemove={onRemove} />
      </div>

      {/* AI Actions */}
      <div className="border-t border-surface-200 px-4 py-3">
        <AiAssistActions onAction={onAiAssist} loadingAction={loadingAction} />
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 border-t border-surface-200 bg-surface-0 p-4">
        <button
          onClick={onSave}
          disabled={bullets.length === 0 || isSaving}
          className="w-full rounded-md bg-ember-500 px-5 py-3 text-body font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? 'Saving…' : 'Save distillation'}
        </button>
      </div>
    </div>
  )
}

function formatStage(stage: DistillTarget): string {
  if (stage === 'key_points') return 'Key Points'
  if (stage === 'distilled') return 'Distillation'
  return 'Evergreen'
}
