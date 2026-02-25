type TimeSliderProps = {
  value: number
  oldestDate: string | null
  newestDate: string | null
  onChange: (value: number) => void
  onReset: () => void
}

export function TimeSlider({ value, oldestDate, newestDate, onChange, onReset }: TimeSliderProps) {
  if (!oldestDate || !newestDate) return null

  const startLabel = formatDateLabel(oldestDate)
  const endLabel = formatDateLabel(newestDate)

  return (
    <div
      className="absolute bottom-4 left-4 z-10 rounded-lg bg-surface-100 p-3 shadow-lg"
      onDoubleClick={onReset}
    >
      <div className="relative w-[300px]">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="time-slider h-[3px] w-full cursor-pointer appearance-none rounded-full bg-surface-200"
        />
        <div className="mt-2 flex justify-between">
          <span className="text-caption text-surface-300">{startLabel}</span>
          <span className="text-caption text-surface-300">{endLabel}</span>
        </div>
      </div>
    </div>
  )
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
