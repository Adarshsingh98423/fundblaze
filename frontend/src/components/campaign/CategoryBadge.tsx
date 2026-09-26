import { cn } from '@/utils/cn'
import type { CampaignCategory } from '@/types/campaign.types'

const categoryConfig: Record<CampaignCategory, { color: string; bg: string }> = {
  Technology: { color: 'text-blue-400', bg: 'bg-blue-400/15 border-blue-400/25' },
  Medical: { color: 'text-rose-400', bg: 'bg-rose-400/15 border-rose-400/25' },
  Education: { color: 'text-violet-400', bg: 'bg-violet-400/15 border-violet-400/25' },
  Environment: { color: 'text-emerald-400', bg: 'bg-emerald-400/15 border-emerald-400/25' },
  Arts: { color: 'text-amber-400', bg: 'bg-amber-400/15 border-amber-400/25' },
  Community: { color: 'text-cyan-400', bg: 'bg-cyan-400/15 border-cyan-400/25' },
}

interface CategoryBadgeProps {
  category: CampaignCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || { color: 'text-text-secondary', bg: 'bg-white/10 border-white/15' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', config.color, config.bg, className)}>
      {category}
    </span>
  )
}

export { categoryConfig }
