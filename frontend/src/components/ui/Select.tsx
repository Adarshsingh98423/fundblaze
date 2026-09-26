import React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

interface SelectOption { value: string; label: string }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full rounded-xl bg-bg-elevated border border-white/8 text-white appearance-none',
              'px-4 py-2.5 pr-10 text-sm transition-all duration-200',
              'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30',
              'disabled:opacity-50',
              error && 'border-error/50',
              className
            )}
            {...props}
          >
            {placeholder && <option value="" className="bg-bg-card">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value} className="bg-bg-card">{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
