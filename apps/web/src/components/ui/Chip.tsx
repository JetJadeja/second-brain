interface ChipProps {
  label: string
  className?: string
}

export function Chip({ label, className = '' }: ChipProps) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium text-text-secondary bg-active rounded ${className}`}>
      {label}
    </span>
  )
}
