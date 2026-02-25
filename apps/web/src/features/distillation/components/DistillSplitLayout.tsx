import { useEffect, useRef, useCallback } from 'react'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useDistillation } from '../hooks/useDistillation'
import { usePanelResize } from '../hooks/usePanelResize'
import { SourcePanel } from './SourcePanel'
import { WorkspacePanel } from './WorkspacePanel'
import type { DistillAction } from '../types/distillation.types'

const AI_ACTION_KEYS: DistillAction[] = ['compress', 'one_sentence', 'surprising_claims', 'connections']

export function DistillSplitLayout() {
  const d = useDistillation()
  const { leftPercent, isDragging, containerRef, dividerProps } = usePanelResize()
  const prevCollapsed = useRef(false)

  // Collapse sidebar on mount, restore on unmount
  useEffect(() => {
    prevCollapsed.current = useSidebarStore.getState().isCollapsed
    useSidebarStore.getState().setCollapsed(true)
    return () => useSidebarStore.getState().setCollapsed(prevCollapsed.current)
  }, [])

  // beforeunload warning for unsaved changes
  useEffect(() => {
    if (!d.isDirty) return
    function handler(e: BeforeUnloadEvent) { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [d.isDirty])

  // Keyboard shortcuts
  useKeyboardShortcut('Enter', d.save, { meta: true, enableInInputs: true })
  useKeyboardShortcut('Escape', d.tryExit, { enableInInputs: true })

  const aiShortcut = useCallback((idx: number) => {
    const action = AI_ACTION_KEYS[idx]
    if (action) d.aiAssist(action)
  }, [d])

  useKeyboardShortcut('1', () => aiShortcut(0), { meta: true, shift: true, enableInInputs: true })
  useKeyboardShortcut('2', () => aiShortcut(1), { meta: true, shift: true, enableInInputs: true })
  useKeyboardShortcut('3', () => aiShortcut(2), { meta: true, shift: true, enableInInputs: true })
  useKeyboardShortcut('4', () => aiShortcut(3), { meta: true, shift: true, enableInInputs: true })

  if (d.isLoading || !d.note) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-body text-surface-400">Loading distillation…</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`flex h-full ${isDragging ? 'select-none' : ''}`}
    >
      {/* Left: Source */}
      <div style={{ width: `${leftPercent}%` }} className="h-full overflow-hidden">
        <SourcePanel note={d.note} highlights={d.highlights} onAddBullet={d.addBullet} />
      </div>

      {/* Divider */}
      <div
        {...dividerProps}
        className="group relative flex w-px cursor-col-resize items-center justify-center bg-surface-200 hover:w-[3px] hover:bg-surface-300"
      >
        <div className="flex flex-col gap-[3px] opacity-0 group-hover:opacity-100">
          <span className="h-[3px] w-[3px] rounded-full bg-surface-300" />
          <span className="h-[3px] w-[3px] rounded-full bg-surface-300" />
          <span className="h-[3px] w-[3px] rounded-full bg-surface-300" />
        </div>
      </div>

      {/* Right: Workspace */}
      <div style={{ width: `${100 - leftPercent}%` }} className="h-full overflow-hidden">
        <WorkspacePanel
          note={d.note}
          bullets={d.bullets}
          targetStage={d.targetStage}
          isDirty={d.isDirty}
          isSaving={d.isSaving}
          canUndo={d.canUndo}
          loadingAction={d.loadingAction}
          showDiscard={d.showDiscard}
          onUpdate={d.updateBullet}
          onAdd={d.addBullet}
          onRemove={d.removeBullet}
          onAiAssist={d.aiAssist}
          onUndo={d.undo}
          onSave={d.save}
          onExit={d.tryExit}
          onConfirmDiscard={d.confirmDiscard}
          onCancelDiscard={d.cancelDiscard}
        />
      </div>
    </div>
  )
}
