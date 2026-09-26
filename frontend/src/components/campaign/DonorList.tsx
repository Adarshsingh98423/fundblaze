import { Avatar } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { getTimeAgo } from '@/utils/formatDate'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Donation } from '@/types/donation.types'

interface DonorListProps {
  donations: Donation[]
  loading?: boolean
}

export function DonorList({ donations, loading }: DonorListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!donations.length) {
    return (
      <div className="py-10 text-center text-text-muted">
        <p className="text-4xl mb-3">💝</p>
        <p className="font-medium">Be the first to donate!</p>
        <p className="text-sm mt-1">Your support can make a real difference.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-white/5">
      {donations.map(d => (
        <div key={d.id} className="flex items-center gap-3 py-3.5">
          <Avatar
            src={!d.anonymous ? d.donorAvatar : undefined}
            fallback={d.anonymous ? '?' : d.donorName?.[0]}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">
              {d.anonymous ? 'Anonymous' : (d.donorName || 'Supporter')}
            </p>
            {d.message && <p className="text-xs text-text-muted truncate mt-0.5 italic">"{d.message}"</p>}
            <p className="text-xs text-text-muted">{getTimeAgo(d.createdAt)}</p>
          </div>
          <span className="text-sm font-bold text-primary shrink-0">{formatCurrency(d.amount)}</span>
        </div>
      ))}
    </div>
  )
}
