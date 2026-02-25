import { create } from 'zustand'

export type ToastType = 'success' | 'ai' | 'warning' | 'error'

export type ToastItem = {
  id: string
  type: ToastType
  message: string
  action?: { label: string; onClick: () => void }
  duration: number
}

type ToastOptions = {
  type: ToastType
  message: string
  action?: { label: string; onClick: () => void }
  duration?: number
}

type ToastStore = {
  toasts: ToastItem[]
  toast: (options: ToastOptions) => string
  dismissToast: (id: string) => void
}

const MAX_VISIBLE = 5
const DEFAULT_DURATION = 4000

let nextId = 0
function generateId(): string {
  nextId += 1
  return `toast-${nextId}-${Date.now()}`
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  toast(options: ToastOptions): string {
    const id = generateId()
    const item: ToastItem = {
      id,
      type: options.type,
      message: options.message,
      action: options.action,
      duration: options.duration ?? DEFAULT_DURATION,
    }

    set((state) => ({
      toasts: [item, ...state.toasts].slice(0, MAX_VISIBLE),
    }))

    return id
  },

  dismissToast(id: string): void {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
