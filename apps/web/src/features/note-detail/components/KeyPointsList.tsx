type KeyPointsListProps = {
  points: string[]
}

export function KeyPointsList({ points }: KeyPointsListProps) {
  if (points.length === 0) return null

  return (
    <ul className="space-y-2">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-2 inline-block size-1 shrink-0 rounded-full bg-surface-300" />
          <span className="text-body text-surface-500">{point}</span>
        </li>
      ))}
    </ul>
  )
}
