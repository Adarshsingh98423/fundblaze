import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BadgeCheck, Twitter, Linkedin, Globe } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/utils/formatCurrency'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: authUser } = useAuthStore()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userService.getProfile(username!),
    enabled: !!username,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (error || !profile) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">😕</p>
            <h2 className="font-sans font-bold text-2xl text-white mb-3">Profile not found</h2>
            <p className="text-text-muted mb-6">This user doesn't exist or their profile is private.</p>
            <Link to="/"><Button>Back to Home</Button></Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const isOwnProfile = authUser?.username === profile.username

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
              <img
                src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FF6B00&color=fff&size=80`}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-bg-card shadow-xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-sans font-bold text-2xl text-white">{profile.name}</h1>
                  {profile.verified && <BadgeCheck className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-text-muted text-sm">@{profile.username}</p>
              </div>
              {isOwnProfile ? (
                <Link to="/dashboard?tab=Settings">
                  <Button variant="ghost" size="sm">Edit Profile</Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm">Follow</Button>
              )}
            </div>
            {profile.bio && (
              <p className="text-text-secondary text-sm leading-relaxed mb-4 max-w-xl">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks?.twitter && (
                <a
                  href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-[#1DA1F2] transition-colors"
                >
                  <Twitter className="w-4 h-4" />{profile.socialLinks.twitter}
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-[#0A66C2] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />LinkedIn
                </a>
              )}
              {profile.socialLinks?.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4" />{profile.socialLinks.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Raised', value: formatCurrency(profile.stats?.totalRaised || 0) },
            { label: 'Campaigns', value: (profile.stats?.totalCampaigns ?? profile.stats?.activeCampaigns ?? 0).toLocaleString() },
            { label: 'Total Donors', value: (profile.stats?.totalDonors || 0).toLocaleString() },
            { label: 'Campaigns Backed', value: (profile.stats?.campaignsBacked || 0).toLocaleString() },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center"
            >
              <p className="font-sans font-bold text-xl text-white">{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Campaigns */}
        {profile.campaigns && profile.campaigns.length > 0 ? (
          <div className="mb-6">
            <h2 className="font-sans font-bold text-xl text-white mb-6">Campaigns Created</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.campaigns.map((c, i) => (
                <CampaignCard key={c.id || String(i)} campaign={c as any} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-white/8 bg-white/[0.02]">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-text-muted">No campaigns yet.</p>
            {isOwnProfile && (
              <Link to="/campaigns/new" className="mt-4 inline-block">
                <Button>Create Your First Campaign</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
