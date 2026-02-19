import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  count?: number
  action?: ReactNode
}

export function SectionHeader({ title, count, action }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-lg font-semibold text-text-primary">
        {title}
        {count !== undefined && (
          <span className="text-sm font-normal text-text-tertiary ml-2">({count})</span>
        )}
      </h2>
      {action}
    </div>
  )
}
