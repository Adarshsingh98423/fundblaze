import { useUIStore } from '@/store/uiStore'

export function useToast() {
  const { addToast, removeToast } = useUIStore()
  return {
    toast: addToast,
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    dismiss: removeToast,
  }
}
