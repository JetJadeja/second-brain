import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, action?: Toast['action']) => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, action) => {
    const id = String(++toastCounter)
    set((state) => ({ toasts: [...state.toasts, { id, message, action }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
