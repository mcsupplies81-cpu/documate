import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2)
    const duration = toast.duration ?? 4000
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
    if (duration > 0) setTimeout(() => get().remove(id), duration)
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  success: (title, message) => get().add({ type: 'success', title, message }),
  error: (title, message) => get().add({ type: 'error', title, message, duration: 6000 }),
  warning: (title, message) => get().add({ type: 'warning', title, message }),
  info: (title, message) => get().add({ type: 'info', title, message }),
}))

// Convenience hook
export const useToast = () => {
  const { success, error, warning, info } = useToastStore()
  return { success, error, warning, info }
}

// App-wide search/command state
interface CommandStore {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const useCommandStore = create<CommandStore>(set => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set(s => ({ open: !s.open })),
}))
