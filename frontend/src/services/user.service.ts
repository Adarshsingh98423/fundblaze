import { api } from './api'
import type { User } from '@/types/user.types'
import type { Campaign } from '@/types/campaign.types'

export interface PublicProfile extends User {
  campaigns: Campaign[]
}

export interface DashboardStats {
  totalRaised: number
  totalDonors: number
  avgDonation: number
  activeCampaigns: number
  fundedCampaigns: number
  totalCampaigns: number
  weeklyChart: { day: string; amount: number; donations: number }[]
  recentDonations: {
    id: string
    campaignTitle: string
    donorName: string
    donorAvatar: string | null
    amount: number
    message: string
    createdAt: string
  }[]
  donationSources: { name: string; value: number; color: string }[]
}

export const userService = {
  async getProfile(usernameOrId: string): Promise<PublicProfile> {
    const { data } = await api.get(`/users/${usernameOrId}`)
    return data
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.put('/users/me', payload)
    return data
  },

  async getMyCampaigns(): Promise<Campaign[]> {
    const { data } = await api.get('/campaigns/my')
    return data
  },

  async getMyDonations(page = 1): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const { data } = await api.get('/donations/my', { params: { page } })
    return data
  },

  async getMyStats(): Promise<DashboardStats> {
    const { data } = await api.get('/users/me/stats')
    return data
  },
}
