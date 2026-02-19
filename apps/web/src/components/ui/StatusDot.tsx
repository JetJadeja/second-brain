interface StatusDotProps {
  color: string
  label?: string
  className?: string
}

export function StatusDot({ color, label, className = '' }: StatusDotProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} title={label}>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label && <span className="text-xs text-text-tertiary">{label}</span>}
    </span>
  )
}
