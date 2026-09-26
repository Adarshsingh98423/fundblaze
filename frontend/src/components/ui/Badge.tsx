import React from 'react'
import { cn } from '@/utils/cn'

// Badge
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary border border-primary/25',
    success: 'bg-success/15 text-success border border-success/25',
    warning: 'bg-warning/15 text-warning border border-warning/25',
    error: 'bg-error/15 text-error border border-error/25',
    gold: 'bg-accent-gold/15 text-accent-gold border border-accent-gold/25',
    outline: 'bg-transparent border border-white/15 text-text-secondary',
  }
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' }

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}

// Avatar
interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
  online?: boolean
}

export function Avatar({ src, alt, size = 'md', fallback, className, online }: AvatarProps) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' }

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className={cn('rounded-full object-cover ring-2 ring-white/8', sizes[size])} />
      ) : (
        <div className={cn('rounded-full bg-bg-elevated flex items-center justify-center font-semibold text-text-secondary ring-2 ring-white/8', sizes[size])}>
          {fallback?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      {online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-bg-deep" />}
    </div>
  )
}

// Spinner
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={cn('border-2 border-white/10 border-t-primary rounded-full animate-spin', sizes[size], className)} />
  )
}

// Card
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-xl',
        hover && 'cursor-pointer transition-all duration-300 hover:border-primary/20 hover:shadow-glow hover:bg-white/[0.05]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
