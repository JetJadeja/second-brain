interface ChipProps {
  label: string
  className?: string
  onClick?: () => void
}

export function Chip({ label, className = '', onClick }: ChipProps) {
  const interactive = onClick ? 'cursor-pointer hover:bg-hover' : ''
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium text-text-secondary bg-active rounded ${interactive} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
    >
      {label}
    </span>
  )
}
