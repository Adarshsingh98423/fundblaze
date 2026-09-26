import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign } from '@/types/campaign.types'

type DraftCampaign = Partial<Campaign> & { step?: number }

interface CampaignStore {
  draftCampaign: DraftCampaign
  updateDraft: (fields: Partial<DraftCampaign>) => void
  clearDraft: () => void
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      draftCampaign: { step: 1 },
      updateDraft: (fields) =>
        set((state) => ({ draftCampaign: { ...state.draftCampaign, ...fields } })),
      clearDraft: () => set({ draftCampaign: { step: 1 } }),
    }),
    { name: 'fb-campaign-draft' }
  )
)
