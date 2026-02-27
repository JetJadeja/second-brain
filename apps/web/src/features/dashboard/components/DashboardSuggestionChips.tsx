import { Sparkles } from 'lucide-react'

type DashboardSuggestionChipsProps = {
  chips: string[]
}

export function DashboardSuggestionChips({ chips }: DashboardSuggestionChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex justify-center gap-2 mt-3">
      {chips.map((chip) => (
        <button
          key={chip}
          disabled
          className="flex items-center gap-1 px-2.5 py-1 bg-surface-150 rounded-sm font-body-sm text-surface-400 opacity-50 cursor-not-allowed"
        >
          <Sparkles size={12} className="text-ember-500" />
          <span>{chip}</span>
        </button>
      ))}
    </div>
  )
}
