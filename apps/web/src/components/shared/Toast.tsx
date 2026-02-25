import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Sparkles, X, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToastItem, ToastType } from '@/stores/toast.store'

const ICON_MAP: Record<ToastType, LucideIcon> = {
  success: Check,
  ai: Sparkles,
  warning: AlertTriangle,
  error: XCircle,
}

const ICON_COLOR_MAP: Record<ToastType, string> = {
  success: 'text-success',
  ai: 'text-ember-500',
  warning: 'text-status-keypoints',
  error: 'text-danger',
}

export type ToastProps = {
  toast: ToastItem
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [remaining, setRemaining] = useState(toast.duration)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const progress = (remaining / toast.duration) * 100
  const Icon = ICON_MAP[toast.type]

  useEffect(() => {
    if (isPaused) return

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 50) {
          onDismiss(toast.id)
          return 0
        }
        return prev - 50
      })
    }, 50)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, toast.id, onDismiss])

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 bg-surface-100 rounded-md shadow-elevated px-3 py-2.5',
        'min-w-[280px] max-w-[360px] overflow-hidden',
        'animate-[slide-up_200ms_var(--ease-out)]',
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Icon size={16} className={cn('shrink-0', ICON_COLOR_MAP[toast.type])} />

      <span className="flex-1 font-body-sm text-surface-600 truncate">{toast.message}</span>

      {toast.action && (
        <button
          type="button"
          className="shrink-0 font-body-sm text-ember-500 hover:text-ember-600 transition-colors"
          onClick={toast.action.onClick}
        >
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        className="shrink-0 text-surface-300 hover:text-surface-400 transition-colors"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-200">
        <div
          className="h-full bg-ember-500 transition-[width] duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
