import { api } from './api'
import type { Campaign, GetCampaignsParams, PaginatedResponse } from '@/types/campaign.types'

export const campaignService = {
  async getCampaigns(params: GetCampaignsParams): Promise<PaginatedResponse<Campaign>> {
    const { data } = await api.get('/campaigns', { params })
    return data
  },

  async getCampaignBySlug(slug: string): Promise<Campaign> {
    const { data } = await api.get(`/campaigns/${slug}`)
    return data
  },

  async getTrendingCampaigns(): Promise<Campaign[]> {
    const { data } = await api.get('/campaigns/trending')
    return data
  },

  async createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
    const { data } = await api.post('/campaigns', payload)
    return data
  },

  async updateCampaign(id: string, payload: Partial<Campaign>): Promise<Campaign> {
    const { data } = await api.put(`/campaigns/${id}`, payload)
    return data
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/campaigns/${id}`)
  },

  async searchCampaigns(query: string): Promise<Campaign[]> {
    const { data } = await api.get('/campaigns', { params: { q: query, limit: 5 } })
    return data.data || []
  },
}
