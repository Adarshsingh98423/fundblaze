import React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'

    const variants = {
      primary: 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg hover:shadow-glow hover:brightness-110',
      ghost: 'bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20',
      outline: 'bg-transparent border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary',
      danger: 'bg-error/10 border border-error/30 text-error hover:bg-error/20',
      secondary: 'bg-bg-elevated text-text-secondary hover:text-white hover:bg-white/5',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
