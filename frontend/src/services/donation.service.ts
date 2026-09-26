import { api } from './api'
import type { CreateDonationDto, Donation } from '@/types/donation.types'
import type { PaginatedResponse } from '@/types/campaign.types'

export const donationService = {
  async createDonation(data: CreateDonationDto): Promise<Donation> {
    const { data: res } = await api.post('/donations', data)
    return res
  },

  async getCampaignDonations(campaignId: string, page = 1): Promise<PaginatedResponse<Donation>> {
    const { data } = await api.get(`/donations/${campaignId}`, { params: { page } })
    return data
  },
}
