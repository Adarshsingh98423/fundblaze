import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignService } from '@/services/campaign.service'
import type { GetCampaignsParams } from '@/types/campaign.types'

export const campaignKeys = {
  all: ['campaigns'] as const,
  trending: () => [...campaignKeys.all, 'trending'] as const,
  list: (params: GetCampaignsParams) => [...campaignKeys.all, 'list', params] as const,
  detail: (slug: string) => [...campaignKeys.all, 'detail', slug] as const,
}

export function useTrendingCampaigns() {
  return useQuery({
    queryKey: campaignKeys.trending(),
    queryFn: campaignService.getTrendingCampaigns,
    staleTime: 60_000,
  })
}

export function useCampaign(slug: string) {
  return useQuery({
    queryKey: campaignKeys.detail(slug),
    queryFn: () => campaignService.getCampaignBySlug(slug),
    enabled: !!slug,
    staleTime: 30_000,
  })
}

export function useInfiniteCampaigns(params: Omit<GetCampaignsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: campaignKeys.list(params),
    queryFn: ({ pageParam }) =>
      campaignService.getCampaigns({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: campaignService.createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: campaignService.deleteCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  })
}
