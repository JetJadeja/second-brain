type DiscardPromptProps = {
  onDiscard: () => void
  onKeepEditing: () => void
}

export function DiscardPrompt({ onDiscard, onKeepEditing }: DiscardPromptProps) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-surface-150 p-3">
      <span className="text-body-sm text-surface-500">Discard changes?</span>
      <button
        onClick={onDiscard}
        className="text-body-sm text-red-500 transition-colors hover:text-red-600"
      >
        Discard
      </button>
      <button
        onClick={onKeepEditing}
        className="text-body-sm text-ember-500 transition-colors hover:text-ember-600"
      >
        Keep editing
      </button>
    </div>
  )
}
