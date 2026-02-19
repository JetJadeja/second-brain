interface BadgeProps {
  count: number
  className?: string
}

export function Badge({ count, className = '' }: BadgeProps) {
  if (count <= 0) return null

  return (
    <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium text-white bg-badge-accent rounded-full ${className}`}>
      {count}
    </span>
  )
}
