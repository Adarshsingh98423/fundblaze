import { CampaignCard } from './CampaignCard'
import { CampaignCardSkeleton } from '@/components/ui/Skeleton'
import type { Campaign } from '@/types/campaign.types'

interface CampaignGridProps {
  campaigns: Campaign[]
  loading?: boolean
  skeletonCount?: number
}

export function CampaignGrid({ campaigns, loading, skeletonCount = 9 }: CampaignGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign, i) => (
        <CampaignCard key={campaign.id} campaign={campaign} index={i} />
      ))}
    </div>
  )
}
