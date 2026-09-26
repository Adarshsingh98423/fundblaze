import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { calculateProgress } from '@/utils/calculateProgress'

interface ProgressBarProps {
  current: number
  goal: number
  animated?: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressBar({ current, goal, animated = true, showLabel = false, size = 'sm', className }: ProgressBarProps) {
  const [width, setWidth] = useState(0)
  const percentage = calculateProgress(current, goal)
  const isFunded = percentage >= 100

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setWidth(percentage), 100)
      return () => clearTimeout(t)
    } else {
      setWidth(percentage)
    }
  }, [percentage, animated])

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3' }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className={cn('text-xs font-semibold', isFunded ? 'text-success' : 'text-primary')}>
            {percentage}% funded
          </span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-white/8 overflow-hidden', heights[size])}>
        <motion.div
          className={cn(
            'h-full rounded-full transition-colors',
            isFunded
              ? 'bg-gradient-to-r from-success to-emerald-400'
              : 'bg-gradient-to-r from-primary to-primary-light'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ type: 'spring', damping: 30, stiffness: 120, delay: 0.1 }}
        />
      </div>
    </div>
  )
}
