import React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, className, id, value, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={textareaId} className="text-sm font-medium text-text-secondary">{label}</label>
            {showCount && maxLength && (
              <span className={cn('text-xs', currentLength > maxLength * 0.9 ? 'text-warning' : 'text-text-muted')}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-xl bg-bg-elevated border border-white/8 text-white placeholder:text-text-muted',
            'px-4 py-3 text-sm transition-all duration-200 resize-none',
            'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
            'disabled:opacity-50',
            error && 'border-error/50 focus:border-error',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
