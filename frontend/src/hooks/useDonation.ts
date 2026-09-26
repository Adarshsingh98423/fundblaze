import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { donationService } from '@/services/donation.service'
import { campaignKeys } from './useCampaigns'
import type { CreateDonationDto } from '@/types/donation.types'

export function useCampaignDonations(campaignId: string) {
  return useQuery({
    queryKey: ['donations', campaignId],
    // Accept MongoDB ObjectIds and mock IDs like "new-1234567890"
    queryFn: () => donationService.getCampaignDonations(campaignId),
    enabled: !!campaignId && (/^[a-f\d]{24}$/i.test(campaignId) || campaignId.startsWith('new-')),
    staleTime: 30_000,
  })
}

export function useDonate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDonationDto) => donationService.createDonation(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['donations', variables.campaignId] })
      qc.invalidateQueries({ queryKey: campaignKeys.all })
      qc.invalidateQueries({ queryKey: ['my-stats'] })
    },
  })
}
