import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Users, ShieldCheck, BadgeCheck, ExternalLink, Calendar } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ProgressBar } from '@/components/campaign/ProgressBar'
import { CountdownTimer } from '@/components/campaign/CountdownTimer'
import { CategoryBadge } from '@/components/campaign/CategoryBadge'
import { ShareButtons } from '@/components/campaign/ShareButtons'
import { DonorList } from '@/components/campaign/DonorList'
import { DonationModal } from '@/components/donation/DonationModal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCampaign } from '@/hooks/useCampaigns'
import { useCampaignDonations } from '@/hooks/useDonation'
import { formatCurrency, formatFullCurrency } from '@/utils/formatCurrency'
import { formatDate, getTimeAgo } from '@/utils/formatDate'
import { calculateProgress } from '@/utils/calculateProgress'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'

type TabType = 'story' | 'updates' | 'donors'

export function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: campaign, isLoading } = useCampaign(slug!)
  // Use campaign.id (MongoDB ObjectId) for donations, not the slug
  const { data: donationsData, isLoading: donationsLoading } = useCampaignDonations(campaign?.id ?? '')
  const [activeTab, setActiveTab] = useState<TabType>('story')
  const [donateOpen, setDonateOpen] = useState(false)
  const { user } = useAuthStore()

  // Prevent donating to your own campaign
  const isOwnCampaign = !!(user && campaign && (
    user.id === campaign.creator.id || user.username === campaign.creator.username
  ))

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="aspect-video w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!campaign) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">😕</p>
            <h2 className="font-sans font-bold text-2xl text-white mb-3">Campaign not found</h2>
            <Link to="/explore"><Button>Browse Campaigns</Button></Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const pct = calculateProgress(campaign.raisedAmount, campaign.goalAmount)
  const donations = donationsData?.data ?? []

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-white transition-colors">Explore</Link>
          <span>/</span>
          <CategoryBadge category={campaign.category} />
          {campaign.creator.verified && (
            <span className="flex items-center gap-1 text-primary ml-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Project
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-white leading-tight break-words [overflow-wrap:anywhere]">
              {campaign.title}
            </h1>

            {/* Cover media */}
            <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl aspect-video">
              {campaign.videoUrl ? (
                <div className="relative w-full h-full">
                  <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <a href={campaign.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                      <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                    </a>
                  </div>
                </div>
              ) : campaign.coverImage ? (
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
                  <span className="text-text-muted text-sm">No cover image</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-white/8">
              <div className="flex gap-1">
                {(['story', 'updates', 'donors'] as TabType[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px',
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-muted hover:text-white'
                    )}
                  >
                    {tab}
                    {tab === 'updates' && campaign.updates.length > 0 && (
                      <span className="ml-1.5 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{campaign.updates.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="min-h-[300px]">
              {activeTab === 'story' && (
                <div
                  className="prose-custom text-text-secondary leading-relaxed text-sm space-y-4"
                  dangerouslySetInnerHTML={{ __html: campaign.story }}
                  style={{
                    '--tw-prose-body': '#A0A0B8',
                    '--tw-prose-headings': '#fff',
                  } as React.CSSProperties}
                />
              )}

              {activeTab === 'updates' && (
                <div className="space-y-6">
                  {campaign.updates.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                      <p className="text-4xl mb-3">📢</p>
                      <p>No updates yet. Stay tuned!</p>
                    </div>
                  ) : (
                    campaign.updates.map(update => (
                      <div key={update.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-xs text-text-muted">{getTimeAgo(update.createdAt)}</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">{update.title}</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{update.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'donors' && (
                <DonorList donations={donations} loading={donationsLoading} />
              )}
            </div>
          </div>

          {/* Right: Sticky sidebar */}
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Progress card */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-sans font-extrabold text-2xl text-white">{formatFullCurrency(campaign.raisedAmount)}</span>
                  <span className="text-sm text-text-muted">raised of {formatCurrency(campaign.goalAmount)} goal</span>
                </div>
                <ProgressBar current={campaign.raisedAmount} goal={campaign.goalAmount} size="md" showLabel />
                <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                  <span className={pct >= 100 ? 'text-success font-semibold' : ''}>{pct}% Funded</span>
                  <span>₹{Math.max(0, campaign.goalAmount - campaign.raisedAmount).toLocaleString('en-IN')} to go</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
                  <CountdownTimer deadline={campaign.deadline} />
                  <p className="text-xs text-text-muted mt-1">Days left</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className="w-4 h-4 text-text-secondary" />
                    <span className="font-bold text-white text-lg">{campaign.donorCount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Donors</p>
                </div>
              </div>

              {campaign.status === 'active' ? (
                isOwnCampaign ? (
                  <div className="flex items-center justify-center gap-2 py-3 mb-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    This is your campaign
                  </div>
                ) : (
                  <Button fullWidth size="lg" onClick={() => setDonateOpen(true)} className="mb-3">
                    <Heart className="w-5 h-5" />
                    Donate Now
                  </Button>
                )
              ) : (
                <div className="text-center py-3 mb-3 rounded-xl border border-white/8 text-text-muted text-sm">
                  {campaign.status === 'funded' ? '🏆 Campaign Fully Funded!' : '⏰ Campaign Ended'}
                </div>
              )}

              {/* Share */}
              <div className="flex items-center justify-between pt-3 border-t border-white/8">
                <span className="text-sm text-text-muted">Share</span>
                <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={campaign.title} />
              </div>
            </div>

            {/* Creator card */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-4">Campaign Creator</p>
              <div className="flex items-start gap-3 mb-4">
                <Avatar
                  src={campaign.creator.avatar || undefined}
                  fallback={campaign.creator.name}
                  size="lg"
                  online={campaign.creator.verified}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white">{campaign.creator.name}</p>
                    {campaign.creator.verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-text-muted">Campaign Creator</p>
                </div>
              </div>
              {campaign.creator.bio && (
                <p className="text-xs text-text-secondary leading-relaxed mb-4">{campaign.creator.bio}</p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4 text-center text-xs">
                <div className="rounded-lg bg-white/[0.03] border border-white/8 py-2">
                  <p className="font-bold text-white">{campaign.creator.totalCampaigns}</p>
                  <p className="text-text-muted">Campaigns</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] border border-white/8 py-2">
                  <p className="font-bold text-white">{formatCurrency(campaign.creator.totalRaised)}</p>
                  <p className="text-text-muted">Total Raised</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/profile/${campaign.creator.username}`}>
                  <Button variant="ghost" fullWidth size="sm">View Profile</Button>
                </Link>
                <a href={`mailto:${campaign.creator.contactEmail || `${campaign.creator.username}@fundblaze.com`}?subject=Contact Creator: ${campaign.creator.name} (@${campaign.creator.username})&body=Regarding the campaign "${campaign.title}"...%0D%0A%0D%0AMy message:%0D%0A`} className="w-full">
                  <Button variant="outline" size="sm" fullWidth>Contact</Button>
                </a>
              </div>
            </div>

            {/* Guarantee */}
            <div className="rounded-2xl border border-success/20 bg-success/5 p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">FundBlaze Guaranteed</p>
                <p className="text-xs text-text-muted mt-0.5">Your donation is protected and secure.</p>
              </div>
            </div>

            {/* Reward tiers */}
            {campaign.rewardTiers && campaign.rewardTiers.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                <p className="text-sm font-bold text-white mb-4">🎁 Reward Tiers</p>
                <div className="space-y-3">
                  {campaign.rewardTiers.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => { if (!isOwnCampaign) setDonateOpen(true) }}
                      disabled={isOwnCampaign}
                      className={cn(
                        "w-full text-left rounded-xl border border-white/8 p-4 transition-colors",
                        isOwnCampaign
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-primary">{formatCurrency(tier.amount)}</span>
                        {tier.maxClaims && (
                          <span className="text-xs text-text-muted">{tier.claimedCount}/{tier.maxClaims} claimed</span>
                        )}
                      </div>
                      <p className="font-semibold text-sm text-white mb-1">{tier.title}</p>
                      <p className="text-xs text-text-muted">{tier.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DonationModal
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
      />
    </PageWrapper>
  )
}
