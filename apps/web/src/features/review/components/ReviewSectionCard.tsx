import { useState, useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

type ReviewSectionCardProps = {
  title: string
  icon: ReactNode
  count: number
  isComplete: boolean
  defaultOpen?: boolean
  children: ReactNode
}

export function ReviewSectionCard({ title, icon, count, isComplete, defaultOpen = true, children }: ReviewSectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevComplete = useRef(isComplete)

  useEffect(() => {
    if (isComplete && !prevComplete.current) {
      const timer = setTimeout(() => setIsOpen(false), 500)
      return () => clearTimeout(timer)
    }
    prevComplete.current = isComplete
  }, [isComplete])

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-100">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-5"
      >
        <span className={`shrink-0 [&>svg]:size-4 ${isComplete ? 'text-success' : 'text-surface-400'}`}>
          {isComplete ? <Check /> : icon}
        </span>
        <span className={`text-sm font-semibold flex-1 text-left ${isComplete ? 'text-surface-400 line-through' : 'text-surface-700'}`}>
          {title}
        </span>
        {!isComplete && count > 0 && (
          <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-500">
            {count}
          </span>
        )}
        <ChevronDown
          className={`size-4 text-surface-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ maxHeight: isOpen ? contentRef.current?.scrollHeight ?? 'none' : 0 }}
      >
        <div className="px-5 pb-5">
          {children}
        </div>
      </div>
    </div>
  )
}
