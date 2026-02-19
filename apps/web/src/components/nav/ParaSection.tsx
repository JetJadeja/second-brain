import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'

interface ParaSectionProps {
  label: string
  defaultOpen?: boolean
  onAdd?: () => void
  children?: ReactNode
}

export function ParaSection({ label, defaultOpen = false, onAdd, children }: ParaSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <div className="group flex items-center justify-between w-full px-4 py-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wide hover:bg-hover">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {label}
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${label.toLowerCase()}`}
            className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-primary transition-opacity"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
      {open && children && (
        <div className="ml-2">
          {children}
        </div>
      )}
    </div>
  )
}
