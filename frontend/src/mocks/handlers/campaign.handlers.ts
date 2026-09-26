import { http, HttpResponse, delay } from 'msw'
import { mockCampaigns, trendingCampaigns } from '../fixtures/campaigns'
import { mockUsers, mockCredentials } from '../fixtures/users'
import type { Campaign } from '@/types/campaign.types'

export let campaigns = [...mockCampaigns]

export const campaignHandlers = [
  http.get('/api/v1/campaigns', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '9')
    const category = url.searchParams.get('category')
    const sort = url.searchParams.get('sort')
    const q = url.searchParams.get('q')

    let filtered = [...campaigns].filter(c => c.status === 'active' || c.status === 'funded')

    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase())
    }

    if (q) {
      const query = q.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.shortDescription.toLowerCase().includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (sort === 'most_funded') {
      filtered.sort((a, b) => b.raisedAmount / b.goalAmount - a.raisedAmount / a.goalAmount)
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === 'ending_soon') {
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    } else {
      filtered.sort((a, b) => b.donorCount - a.donorCount)
    }

    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)

    return HttpResponse.json({
      success: true,
      data: {
        data: paged,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    })
  }),

  http.get('/api/v1/campaigns/trending', async () => {
    await delay(400)
    return HttpResponse.json({ success: true, data: trendingCampaigns })
  }),

  http.get('/api/v1/campaigns/:slug', async ({ params }) => {
    await delay(400)
    const campaign = campaigns.find(c => c.slug === params.slug || c.id === params.slug)
    
    if (!campaign) {
      return HttpResponse.json(
        { success: false, message: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({ success: true, data: campaign })
  }),

  http.post('/api/v1/campaigns', async ({ request }) => {
    await delay(1000)
    const body = await request.json() as Partial<Campaign>

    // Use the logged-in user as creator based on Authorization header
    const authHeader = request.headers.get('Authorization') ?? ''
    const loggedInUser = Object.values(mockCredentials).find(() =>
      authHeader.startsWith('Bearer mock-')
    )?.user ?? mockUsers[0]

    const newCampaign: Campaign = {
      id: 'new-' + Date.now(),
      slug: (body.title || 'untitled').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: body.title || 'Untitled',
      shortDescription: body.shortDescription || '',
      story: body.story || '',
      coverImage: body.coverImage || undefined,
      category: body.category || 'Community',
      tags: body.tags || [],
      status: 'active',
      goalAmount: body.goalAmount || 100000,
      raisedAmount: 0,
      donorCount: 0,
      deadline: body.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      minDonation: body.minDonation || 100,
      creator: {
        id: loggedInUser.id,
        name: loggedInUser.name,
        username: loggedInUser.username,
        avatar: loggedInUser.avatar ?? '',
        bio: loggedInUser.bio ?? '',
        verified: loggedInUser.verified,
        joinedAt: loggedInUser.createdAt,
        totalCampaigns: (loggedInUser.stats?.activeCampaigns ?? 0) + 1,
        totalRaised: loggedInUser.stats?.totalRaised ?? 0,
      },
        joinedAt: '2023-10-15',
        totalCampaigns: 1,
        totalRaised: 0,
      },
      updates: [],
      rewardTiers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    campaigns.unshift(newCampaign)
    return HttpResponse.json({ success: true, data: newCampaign }, { status: 201 })
  }),

  http.put('/api/v1/campaigns/:id', async ({ params, request }) => {
    await delay(600)
    const body = await request.json() as Partial<Campaign>
    const index = campaigns.findIndex(c => c.id === params.id)
    
    if (index === -1) {
      return HttpResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 })
    }
    
    campaigns[index] = { ...campaigns[index], ...body, updatedAt: new Date().toISOString() }
    return HttpResponse.json({ success: true, data: campaigns[index] })
  }),

  http.delete('/api/v1/campaigns/:id', async ({ params }) => {
    await delay(500)
    campaigns = campaigns.filter(c => c.id !== params.id)
    return HttpResponse.json({ success: true, message: 'Campaign deleted' })
  }),
]
