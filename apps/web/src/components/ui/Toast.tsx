import { X } from 'lucide-react'
import { useToastStore } from '../../stores/toast-store'

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg shadow-lg animate-slide-in"
        >
          <span className="text-sm text-text-primary">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="text-sm font-medium text-blue-500 hover:underline"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </button>
          )}
          <button
            type="button"
            className="text-text-tertiary hover:text-text-primary ml-2"
            onClick={() => removeToast(toast.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
