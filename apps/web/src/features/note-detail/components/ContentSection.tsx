import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type ContentSectionProps = {
  title: string
  defaultOpen?: boolean
  collapsible?: boolean
  children: ReactNode
}

export function ContentSection({ title, defaultOpen = true, collapsible = true, children }: ContentSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300"
        >
          {title}
          <ChevronDown size={12} className={cn('transition-transform duration-200', open && 'rotate-180')} />
        </button>
      ) : (
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-surface-300">{title}</p>
      )}

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'mt-3 max-h-[5000px] opacity-100' : 'max-h-0 opacity-0',
          !collapsible && 'mt-3 max-h-none opacity-100',
        )}
      >
        {children}
      </div>
    </div>
  )
}
