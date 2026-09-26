import { http, HttpResponse, delay } from 'msw'
import { mockDonations } from '../fixtures/donations'
import { campaigns } from './campaign.handlers'
import type { Donation } from '@/types/donation.types'

const donations = [...mockDonations]

export const donationHandlers = [
  http.post('/api/v1/donations', async ({ request }) => {
    await delay(1500)
    const body = await request.json() as Partial<Donation>
    
    const newDonation: Donation = {
      id: 'don-' + Date.now(),
      campaignId: body.campaignId || '',
      campaignTitle: 'Campaign',
      amount: body.amount || 0,
      message: body.message,
      anonymous: body.anonymous || false,
      paymentMethod: body.paymentMethod || 'card',
      status: 'completed',
      createdAt: new Date().toISOString(),
    }
    
    donations.unshift(newDonation)

    // Update the campaign's raisedAmount and donorCount so the UI reflects the donation
    const campaignIndex = campaigns.findIndex(
      c => c.id === body.campaignId || c.slug === body.campaignId
    )
    if (campaignIndex !== -1) {
      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        raisedAmount: campaigns[campaignIndex].raisedAmount + (body.amount || 0),
        donorCount: campaigns[campaignIndex].donorCount + 1,
        updatedAt: new Date().toISOString(),
      }
    }

    return HttpResponse.json({ success: true, data: newDonation }, { status: 201 })
  }),

  http.get('/api/v1/donations/:campaignId', async ({ params }) => {
    await delay(400)
    const campaignDonations = donations.filter(d => d.campaignId === params.campaignId)
    return HttpResponse.json({
      success: true,
      data: {
        data: campaignDonations,
        total: campaignDonations.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),
]
