import { useState, useRef } from 'react'

type HighlightedPassageProps = {
  text: string
  reason: string
  onAddToDistillation: (text: string) => void
}

export function HighlightedPassage({ text, reason, onAddToDistillation }: HighlightedPassageProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShowTooltip(true)
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 200)
  }

  function handleAdd() {
    onAddToDistillation(text)
    setShowTooltip(false)
  }

  return (
    <span
      className="relative inline border-l-2 border-ember-500 bg-ember-500/10 pl-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}

      {showTooltip && (
        <span
          className="absolute bottom-full left-0 z-10 mb-1 flex flex-col gap-1 rounded-md bg-surface-100 p-2 shadow-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="whitespace-nowrap text-caption text-surface-400">
            {reason || 'AI suggests this is important'}
          </span>
          <button
            onClick={handleAdd}
            className="whitespace-nowrap text-left text-caption text-ember-500 hover:underline"
          >
            Use in distillation →
          </button>
        </span>
      )}
    </span>
  )
}
