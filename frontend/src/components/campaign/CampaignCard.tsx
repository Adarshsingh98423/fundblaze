import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import type { Campaign } from '@/types/campaign.types'
import { ProgressBar } from './ProgressBar'
import { CategoryBadge } from './CategoryBadge'
import { CountdownTimer } from './CountdownTimer'
import { Avatar } from '@/components/ui/Badge'
import { calculateProgress } from '@/utils/calculateProgress'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

interface CampaignCardProps {
  campaign: Campaign
  variant?: 'default' | 'compact' | 'featured'
  index?: number
}

export function CampaignCard({ campaign, variant = 'default', index = 0 }: CampaignCardProps) {
  const pct = calculateProgress(campaign.raisedAmount, campaign.goalAmount)
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/campaigns/${campaign.slug}`}
        className={cn(
          'group block rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden',
          'transition-all duration-300 hover:border-primary/25 hover:shadow-glow hover:bg-white/[0.05]',
          variant === 'featured' && 'md:flex'
        )}
      >
        {/* Cover image */}
        <div className={cn('relative overflow-hidden', variant === 'featured' ? 'md:w-1/2 aspect-video md:aspect-auto' : 'aspect-video')}>
          {campaign.coverImage ? (
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              loading="lazy"
              width={640}
              height={360}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-bg-elevated flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                📷
              </div>
              <span className="text-xs text-text-muted">No image</span>
            </div>
          )}
          {/* Overlay badges */}
          <div className="absolute top-3 left-3">
            <CategoryBadge category={campaign.category} />
          </div>
          <div className="absolute top-3 right-3">
            <CountdownTimer deadline={campaign.deadline} compact />
          </div>
          {/* Funded overlay */}
          {pct >= 100 && (
            <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
              <span className="bg-success text-white text-xs font-bold px-3 py-1 rounded-full">✓ FUNDED</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('p-4', variant === 'featured' && 'md:p-6 md:flex md:flex-col md:justify-between md:w-1/2')}>
          <div>
            <h3 className="font-sans font-bold text-white text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {campaign.title}
            </h3>
            {variant !== 'compact' && (
              <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">
                {campaign.shortDescription}
              </p>
            )}
            {/* Creator */}
            <div className="flex items-center gap-2 mb-4">
              <Avatar src={campaign.creator.avatar} fallback={campaign.creator.name} size="xs" />
              <span className="text-xs text-text-muted">
                by <span className="text-text-secondary">{campaign.creator.name}</span>
              </span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <ProgressBar current={campaign.raisedAmount} goal={campaign.goalAmount} />
            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="text-sm font-bold text-white">{formatCurrency(campaign.raisedAmount)}</span>
                <span className="text-xs text-text-muted ml-1">raised</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-text-muted">
                  <Users className="w-3 h-3" />
                  {campaign.donorCount.toLocaleString()}
                </div>
                <span className={cn('text-xs font-semibold', pct >= 100 ? 'text-success' : 'text-primary')}>
                  {pct}%
                </span>
              </div>
            </div>
            {variant !== 'compact' && (
              <p className="text-xs text-text-muted mt-1">
                Goal: {formatCurrency(campaign.goalAmount)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
