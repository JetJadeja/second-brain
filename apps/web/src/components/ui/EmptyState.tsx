import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  message: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {Icon && <Icon size={32} className="text-text-tertiary mb-3" />}
      <p className="text-sm text-text-tertiary">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
