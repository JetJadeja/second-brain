import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  interactive?: boolean
  className?: string
  onClick?: () => void
}

export function Card({ children, interactive = false, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-surface rounded shadow-sm ${
        interactive ? 'hover:shadow transition-shadow cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
