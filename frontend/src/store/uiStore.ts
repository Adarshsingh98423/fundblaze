import { create } from 'zustand'
import type { Toast } from '@/types/api.types'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  toasts: Toast[]
  setSidebarOpen: (open: boolean) => void
  openModal: (name: string) => void
  closeModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeModal: null,
  toasts: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, toast.duration || 4000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
