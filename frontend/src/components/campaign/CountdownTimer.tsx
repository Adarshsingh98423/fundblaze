import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { getDaysLeft } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

interface CountdownTimerProps {
  deadline: string
  className?: string
  compact?: boolean
}

export function CountdownTimer({ deadline, className, compact }: CountdownTimerProps) {
  const [daysLeft, setDaysLeft] = useState(getDaysLeft(deadline))

  useEffect(() => {
    const interval = setInterval(() => setDaysLeft(getDaysLeft(deadline)), 60000)
    return () => clearInterval(interval)
  }, [deadline])

  const isUrgent = daysLeft <= 3
  const isEnded = daysLeft === 0

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-medium', isUrgent ? 'text-error' : 'text-text-muted', className)}>
        <Clock className="w-3 h-3" />
        {isEnded ? 'Ended' : `${daysLeft}d left`}
      </span>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold', isUrgent ? 'border-error/30 bg-error/8 text-error' : 'border-white/8 bg-white/5 text-white')}>
        <Clock className="w-4 h-4" />
        <span>{isEnded ? 'Campaign Ended' : `${daysLeft} days left`}</span>
      </div>
    </div>
  )
}
