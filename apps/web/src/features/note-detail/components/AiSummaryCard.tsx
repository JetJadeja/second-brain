type AiSummaryCardProps = {
  summary: string
}

export function AiSummaryCard({ summary }: AiSummaryCardProps) {
  return (
    <div className="rounded-md border border-surface-200 bg-surface-100 p-4">
      <div className="mb-2 flex items-center gap-1">
        <span className="text-[12px] text-ember-500">✦</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300">
          AI Summary
        </span>
      </div>
      <p className="text-body text-surface-400">{summary}</p>
    </div>
  )
}
