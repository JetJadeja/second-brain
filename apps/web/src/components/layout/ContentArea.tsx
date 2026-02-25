import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/constants/layout'

export type ContentAreaProps = {
  children: ReactNode
  maxReadingWidth?: boolean
  className?: string
}

export function ContentArea({ children, maxReadingWidth = false, className }: ContentAreaProps) {
  return (
    <main
      className={cn('flex-1 overflow-y-auto', className)}
      style={{ minWidth: LAYOUT.CONTENT_MIN_WIDTH }}
    >
      <div
        className={cn('p-6', maxReadingWidth && 'mx-auto')}
        style={maxReadingWidth ? { maxWidth: LAYOUT.CONTENT_MAX_READING_WIDTH } : undefined}
      >
        {children}
      </div>
    </main>
  )
}
