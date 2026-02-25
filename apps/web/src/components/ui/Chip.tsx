interface ChipProps {
  label: string
  className?: string
  truncate?: boolean
  onClick?: () => void
}

export function Chip({ label, className = '', truncate: shouldTruncate, onClick }: ChipProps) {
  const interactive = onClick ? 'cursor-pointer hover:bg-hover' : ''
  const truncateClass = shouldTruncate ? 'max-w-[200px] truncate' : ''
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium text-text-secondary bg-active rounded ${truncateClass} ${interactive} ${className}`}
      title={shouldTruncate ? label : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      {label}
    </span>
  )
}
