import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-error" />,
  info: <Info className="w-5 h-5 text-primary" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
}

const styles = {
  success: 'border-success/25 bg-success/8',
  error: 'border-error/25 bg-error/8',
  info: 'border-primary/25 bg-primary/8',
  warning: 'border-warning/25 bg-warning/8',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl min-w-[280px] max-w-sm',
              styles[toast.type]
            )}
          >
            <span className="mt-0.5 shrink-0">{icons[toast.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.message && <p className="text-xs text-text-secondary mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-text-muted hover:text-white transition-colors mt-0.5"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
