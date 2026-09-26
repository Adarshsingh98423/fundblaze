export type CampaignCategory =
  | 'Technology'
  | 'Medical'
  | 'Education'
  | 'Environment'
  | 'Arts'
  | 'Community'

export type CampaignStatus = 'draft' | 'active' | 'ended' | 'funded'

export interface Creator {
  id: string
  name: string
  username: string
  contactEmail?: string
  avatar: string
  bio: string
  verified: boolean
  joinedAt: string
  totalCampaigns: number
  totalRaised: number
}

export interface CampaignUpdate {
  id: string
  title: string
  content: string
  createdAt: string
}

export interface RewardTier {
  id: string
  title: string
  amount: number
  description: string
  maxClaims?: number
  claimedCount: number
}

export interface Campaign {
  id: string
  slug: string
  title: string
  shortDescription: string
  story: string
  coverImage: string
  videoUrl?: string
  category: CampaignCategory
  tags: string[]
  status: CampaignStatus
  goalAmount: number
  raisedAmount: number
  donorCount: number
  deadline: string
  minDonation: number
  creator: Creator
  updates: CampaignUpdate[]
  rewardTiers: RewardTier[]
  createdAt: string
  updatedAt: string
  location?: string
  isFeatured?: boolean
}

export interface GetCampaignsParams {
  page?: number
  limit?: number
  category?: CampaignCategory
  sort?: 'trending' | 'newest' | 'most_funded' | 'ending_soon'
  q?: string
  status?: CampaignStatus
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
