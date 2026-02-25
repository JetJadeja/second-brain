import type { DistillAction } from '../types/distillation.types'
import { DISTILL_ACTION_LABELS } from '../types/distillation.types'

type AiAssistActionsProps = {
  onAction: (action: DistillAction) => void
  loadingAction: DistillAction | null
}

const ACTIONS: DistillAction[] = ['compress', 'one_sentence', 'surprising_claims', 'connections']

export function AiAssistActions({ onAction, loadingAction }: AiAssistActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {ACTIONS.map((action) => (
        <AiButton
          key={action}
          action={action}
          isLoading={loadingAction === action}
          disabled={loadingAction !== null}
          onClick={() => onAction(action)}
        />
      ))}
    </div>
  )
}

type AiButtonProps = {
  action: DistillAction
  isLoading: boolean
  disabled: boolean
  onClick: () => void
}

function AiButton({ action, isLoading, disabled, onClick }: AiButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 text-body-sm text-surface-400 transition-colors hover:text-surface-500 disabled:opacity-50"
    >
      <span className={`text-xs text-ember-500 ${isLoading ? 'animate-pulse' : ''}`}>✦</span>
      {isLoading ? 'Generating…' : DISTILL_ACTION_LABELS[action]}
    </button>
  )
}
