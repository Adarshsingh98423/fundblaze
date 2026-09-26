import { api } from '@/services/api'
import { mockCampaigns, trendingCampaigns } from './fixtures/campaigns'
import { mockUsers, mockTestUser, mockCredentials } from './fixtures/users'
import { mockDonations } from './fixtures/donations'
import type { Campaign } from '@/types/campaign.types'
import type { Donation } from '@/types/donation.types'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

type StoredDonation = typeof mockDonations[0] & { userId?: string }

// ── Persistent mock state ──────────────────────────────────────────────────────
// Stored in localStorage so mutations survive page reloads, new tabs, and
// account switches. Each key is prefixed so it doesn't clash with app data.
const STORAGE_KEY_CAMPAIGNS = 'mock_campaigns_v2'
const STORAGE_KEY_DONATIONS  = 'mock_donations_v2'

function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAMPAIGNS)
    if (raw) return JSON.parse(raw) as Campaign[]
  } catch {}
  return [...mockCampaigns]
}

function loadDonations(): StoredDonation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DONATIONS)
    if (raw) return JSON.parse(raw) as StoredDonation[]
  } catch {}
  return [...mockDonations]
}

function saveCampaigns() {
  try { localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns)) } catch {}
}

function saveDonations() {
  try { localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(donations)) } catch {}
}

// ── Persisted user overrides (profile edits) ───────────────────────────────
const STORAGE_KEY_USERS = 'mock_users_v2'
type UserOverrides = Record<string, Partial<typeof mockUsers[0]>>

function loadUserOverrides(): UserOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS)
    if (raw) return JSON.parse(raw) as UserOverrides
  } catch {}
  return {}
}

let userOverrides: UserOverrides = loadUserOverrides()

function saveUserOverrides() {
  try { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(userOverrides)) } catch {}
}

/** Returns the user merged with any persisted profile edits */
function resolveUserWithOverrides(config: InternalAxiosRequestConfig) {
  const base = resolveUser(config)
  return { ...base, ...(userOverrides[base.id] ?? {}) }
}

let campaigns: Campaign[] = loadCampaigns()
const donations: StoredDonation[] = loadDonations()

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse {
  return { data: { success: true, data }, status, statusText: 'OK', headers: { 'content-type': 'application/json' }, config }
}

function fail(message: string, status: number, config: InternalAxiosRequestConfig): never {
  const err: any = new Error(message)
  err.response = { data: { success: false, message }, status, statusText: 'Error', headers: {}, config }
  throw err
}

/** Decode the logged-in user from the mock Bearer token */
function resolveUser(config: InternalAxiosRequestConfig) {
  const authHeader = (config.headers as any)?.Authorization as string | undefined
  const token = authHeader?.replace('Bearer ', '') ?? ''
  if (token.startsWith('mock-token-')) {
    try {
      const email = atob(token.replace('mock-token-', ''))
      const account = mockCredentials[email]
      if (account) return account.user
    } catch { /* bad base64 */ }
  }
  return mockUsers[0] // fallback
}

async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method || 'get').toLowerCase()
  const url = (config.url || '').replace(/^\//, '')
  const params = config.params || {}

  let body: Record<string, any> = {}
  try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}) } catch {}

  // Simulate network delay
  await new Promise(r => setTimeout(r, 350))

  // ── AUTH ──────────────────────────────────────────────────────────
  if (method === 'post' && url.includes('auth/login')) {
    const account = mockCredentials[body.email]
    if (account && body.password === account.password) {
      // Encode the email into the token so we can identify the user on subsequent requests
      const mockToken = `mock-token-${btoa(body.email)}`
      return ok({ user: account.user, accessToken: mockToken }, config)
    }
    fail('Invalid email or password', 401, config)
  }

  if (method === 'post' && url.includes('auth/signup')) {
    const newUser = { ...mockUsers[0], id: 'new-' + Date.now(), name: body.name, email: body.email, role: body.role }
    return ok({ user: newUser, accessToken: 'mock-token-new' }, config)
  }

  if (method === 'post' && url.includes('auth/logout')) {
    return ok({ message: 'Logged out' }, config)
  }

  if (method === 'post' && url.includes('auth/refresh')) {
    const currentUser = resolveUser(config)
    const mockToken = `mock-token-${btoa(currentUser.email)}`
    return ok({ accessToken: mockToken }, config)
  }

  if (method === 'get' && url.includes('auth/me')) {
    const auth = (config.headers as any)?.Authorization
    if (!auth) fail('Unauthorized', 401, config)
    return ok(resolveUserWithOverrides(config), config)
  }

  // ── CAMPAIGNS ─────────────────────────────────────────────────────
  if (method === 'get' && url.includes('campaigns/trending')) {
    return ok(trendingCampaigns, config)
  }

  // My campaigns — must come before the generic list handler
  if (method === 'get' && url.includes('campaigns/my')) {
    if (!(config.headers as any)?.Authorization) fail('Unauthorized', 401, config)
    const loggedInUser = resolveUserWithOverrides(config)
    const mine = campaigns.filter(c => c.creator?.username === loggedInUser.username)
    return ok(mine, config)
  }

  // Single campaign by slug/id — must come before list
  const slugMatch = url.match(/campaigns\/([^/?]+)$/)
  if (method === 'get' && slugMatch) {
    const slug = slugMatch[1]
    const campaign = campaigns.find(c => c.slug === slug || c.id === slug)
    if (!campaign) fail('Campaign not found', 404, config)
    return ok(campaign, config)
  }

  if (method === 'get' && url.includes('campaigns')) {
    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '9')
    const category = params.category
    const sort = params.sort
    const q = params.q

    let filtered = campaigns.filter(c => c.status === 'active' || c.status === 'funded')
    if (category && category !== 'all') filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase())
    if (q) {
      const lq = q.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(lq) ||
        c.shortDescription.toLowerCase().includes(lq) ||
        c.tags.some((t: string) => t.toLowerCase().includes(lq))
      )
    }
    if (sort === 'most_funded') filtered.sort((a, b) => b.raisedAmount / b.goalAmount - a.raisedAmount / a.goalAmount)
    else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    else if (sort === 'ending_soon') filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    else filtered.sort((a, b) => b.donorCount - a.donorCount)

    const start = (page - 1) * limit
    return ok({ data: filtered.slice(start, start + limit), total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) }, config)
  }

  if (method === 'post' && url.includes('campaigns')) {
    const loggedInUser = resolveUserWithOverrides(config)

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
      deadline: body.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
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
      updates: [],
      rewardTiers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    campaigns.unshift(newCampaign)
    saveCampaigns()
    return ok(newCampaign, config, 201)
  }

  // ── UPDATE campaign ────────────────────────────────────────────────────────
  if (method === 'put' && url.includes('campaigns')) {
    const loggedInUser = resolveUserWithOverrides(config)
    const idMatch = url.match(/campaigns\/([^/?]+)$/)
    const id = idMatch?.[1]
    if (!id) fail('Campaign id missing', 400, config)
    const index = campaigns.findIndex(c => c.id === id || c.slug === id)
    if (index === -1) fail('Campaign not found', 404, config)
    if (campaigns[index].creator?.username !== loggedInUser.username) {
      fail('Forbidden', 403, config)
    }
    campaigns[index] = { ...campaigns[index], ...body, updatedAt: new Date().toISOString() }
    saveCampaigns()
    return ok(campaigns[index], config)
  }

  // ── DONATIONS ─────────────────────────────────────────────────────
  if (method === 'post' && url.includes('donations')) {
    const loggedInUser = resolveUserWithOverrides(config)
    // Find the campaign to get its title and update its stats
    const campaignIndex = campaigns.findIndex(
      c => c.id === body.campaignId || c.slug === body.campaignId
    )

    // ── SELF-DONATION GUARD ──────────────────────────────────────────
    if (campaignIndex !== -1) {
      const targetCampaign = campaigns[campaignIndex]
      if (
        targetCampaign.creator?.id === loggedInUser.id ||
        targetCampaign.creator?.username === loggedInUser.username
      ) {
        fail('You cannot donate to your own campaign', 403, config)
      }
    }
    const campaignTitle = campaignIndex !== -1 ? campaigns[campaignIndex].title : 'Campaign'
    if (campaignIndex !== -1) {
      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        raisedAmount: campaigns[campaignIndex].raisedAmount + (body.amount || 0),
        donorCount: campaigns[campaignIndex].donorCount + 1,
        updatedAt: new Date().toISOString(),
      }
    }
    const newDonation = {
      id: 'don-' + Date.now(),
      campaignId: body.campaignId || '',
      campaignTitle,
      donorName: body.anonymous ? undefined : loggedInUser.name,
      donorAvatar: body.anonymous ? undefined : loggedInUser.avatar,
      amount: body.amount || 0,
      message: body.message,
      anonymous: body.anonymous || false,
      paymentMethod: body.paymentMethod || 'card',
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      userId: loggedInUser.id,
    }
    donations.unshift(newDonation)
    saveDonations()
    saveCampaigns()  // persist raisedAmount / donorCount update
    return ok(newDonation, config, 201)
  }

  if (method === 'get' && url.includes('donations/my')) {
    const loggedInUser = resolveUserWithOverrides(config)
    const myDonations = donations.filter(d => 
      d.userId === loggedInUser.id || 
      (d.donorName && d.donorName === loggedInUser.name)
    )
    return ok({ data: myDonations, total: myDonations.length, page: 1, limit: 50, totalPages: 1 }, config)
  }

  if (method === 'get' && url.includes('donations')) {
    const campaignId = url.split('donations/').pop()?.split('?')[0]
    const list = donations.filter(d => d.campaignId === campaignId)
    return ok({ data: list, total: list.length, page: 1, limit: 10, totalPages: 1 }, config)
  }

  // ── USERS ──────────────────────────────────────────────────────────
  if (method === 'put' && url.includes('users/me')) {
    const auth = (config.headers as any)?.Authorization
    if (!auth) fail('Unauthorized', 401, config)
    const base = resolveUser(config)
    userOverrides[base.id] = { ...(userOverrides[base.id] ?? {}), ...body }
    saveUserOverrides()
    // Also update creator info on any campaigns owned by this user
    campaigns = campaigns.map(c =>
      c.creator?.id === base.id
        ? { ...c, creator: { ...c.creator, ...body } }
        : c
    )
    saveCampaigns()
    return ok({ ...base, ...userOverrides[base.id] }, config)
  }

  if (method === 'get' && url.includes('users/me/stats')) {
    const loggedInUser = resolveUserWithOverrides(config)
    // Get the logged-in user's campaigns
    const myCampaigns = campaigns.filter(c => c.creator?.username === loggedInUser.username)
    const myCampaignIds = new Set(myCampaigns.map(c => c.id))
    // Get all donations received on the user's campaigns
    const receivedDonations = donations.filter(d => myCampaignIds.has(d.campaignId))

    const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0)
    const totalDonors = myCampaigns.reduce((sum, c) => sum + c.donorCount, 0)
    const avgDonation = receivedDonations.length > 0
      ? Math.round(receivedDonations.reduce((s, d) => s + d.amount, 0) / receivedDonations.length)
      : 0
    const activeCampaigns = myCampaigns.filter(c => c.status === 'active').length
    const fundedCampaigns = myCampaigns.filter(c => c.status === 'funded').length

    // Build weekly chart from actual received donations (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = Date.now()
    const weeklyMap: Record<string, { amount: number; donations: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000)
      weeklyMap[days[d.getDay()]] = { amount: 0, donations: 0 }
    }
    receivedDonations.forEach(d => {
      const age = now - new Date(d.createdAt).getTime()
      if (age <= 7 * 86400000) {
        const dayLabel = days[new Date(d.createdAt).getDay()]
        if (weeklyMap[dayLabel]) {
          weeklyMap[dayLabel].amount += d.amount
          weeklyMap[dayLabel].donations += 1
        }
      }
    })
    const weeklyChart = Object.entries(weeklyMap).map(([day, v]) => ({ day, ...v }))

    // Recent activity: latest donations received on user's campaigns
    const recentDonations = receivedDonations.slice(0, 5).map(d => ({
      id: d.id,
      campaignTitle: d.campaignTitle,
      donorName: d.anonymous ? 'Anonymous' : (d.donorName || 'Anonymous'),
      donorAvatar: d.anonymous ? null : (d.donorAvatar || null),
      amount: d.amount,
      message: d.message || '',
      createdAt: d.createdAt,
    }))

    // Compute donation source breakdown from real payment methods
    const methodColors: Record<string, { label: string; color: string }> = {
      card:       { label: 'Card',        color: '#FF6B00' },
      upi:        { label: 'UPI',         color: '#8B5CF6' },
      netbanking: { label: 'Net Banking', color: '#00D68F' },
      wallet:     { label: 'Wallet',      color: '#FFB300' },
    }
    const methodTotals: Record<string, number> = {}
    receivedDonations.forEach(d => {
      const key = d.paymentMethod || 'card'
      methodTotals[key] = (methodTotals[key] || 0) + d.amount
    })
    const donationSources = Object.entries(methodTotals).map(([method, value]) => ({
      name: methodColors[method]?.label || method,
      value,
      color: methodColors[method]?.color || '#888',
    }))

    return ok({
      totalRaised,
      totalDonors,
      avgDonation,
      activeCampaigns,
      fundedCampaigns,
      totalCampaigns: myCampaigns.length,
      weeklyChart,
      recentDonations,
      donationSources,
    }, config)
  }

  // GET /users/:username — public profile lookup
  if (method === 'get' && url.match(/users\/[^/?]+$/)) {
    const usernameOrId = url.split('users/').pop()?.split('?')[0] || ''
    const found = mockUsers.find(u =>
      u.username === usernameOrId || u.id === usernameOrId || u.email === usernameOrId
    )
    if (!found) fail('User not found', 404, config)

    // Find campaigns this user created
    const userCampaigns = campaigns.filter(c => c.creator?.username === found!.username)
    const userCampaignIds = new Set(userCampaigns.map(c => c.id))
    
    // Find all donations to campaigns created by this user
    const userReceivedDonations = donations.filter(d => userCampaignIds.has(d.campaignId) && d.status === 'completed')
    
    // Calculate total donors (unique donors to their campaigns)
    const uniqueDonors = new Set(userReceivedDonations.map(d => d.userId || d.donorName || 'anonymous')).size
    
    // Calculate total raised
    const totalRaised = userReceivedDonations.reduce((sum, d) => sum + d.amount, 0)
    
    // Find campaigns this user has donated to
    const campaignsBacked = new Set(
      donations
        .filter(d => d.userId === found.id && d.status === 'completed')
        .map(d => d.campaignId)
    ).size

    // Inject computed stats into the profile
    const profileResponse = {
      ...found,
      stats: {
        totalRaised: totalRaised,
        activeCampaigns: userCampaigns.filter(c => c.status === 'active').length,
        totalCampaigns: userCampaigns.length,
        totalDonors: uniqueDonors,
        campaignsBacked: campaignsBacked,
      },
      // Attach their mock campaigns
      campaigns: userCampaigns.filter(c => ['active', 'funded'].includes(c.status)).slice(0, 6)
    }

    return ok(profileResponse, config)
  }

  // ── DELETE campaign ───────────────────────────────────────────────────────
  if (method === 'delete' && url.includes('campaigns')) {
    const loggedInUser = resolveUserWithOverrides(config)
    // Extract id from URL: DELETE /api/v1/campaigns/:id
    const idMatch = url.match(/campaigns\/([^/?]+)$/)
    const id = idMatch?.[1]
    if (!id) fail('Campaign id missing', 400, config)
    const index = campaigns.findIndex(c => c.id === id || c.slug === id)
    if (index === -1) fail('Campaign not found', 404, config)
    // Only the creator can delete their own campaign
    if (campaigns[index].creator?.username !== loggedInUser.username) {
      fail('Forbidden', 403, config)
    }
    campaigns.splice(index, 1)
    saveCampaigns()
    return ok({ message: 'Campaign deleted' }, config)
  }

  // Temporary mock storage for orders pending verification
  const mockOrders: Record<string, { campaignId: string, amount: number }> = (window as any).__mockOrders || ((window as any).__mockOrders = {})

  // ── POST /payments/razorpay/order ────────────────────────────────────────
  if (method === 'post' && url.includes('payments/razorpay/order')) {
    const body = config.data ? JSON.parse(config.data) : {}
    const amount = Number(body.amount) || 500
    const campaignId = body.campaignId || ''
    const orderId = `order_mock_${Date.now()}`
    
    mockOrders[orderId] = { campaignId, amount }

    // Return a fake Razorpay order — enough for the checkout to open in test mode
    return ok({
      orderId,
      donationId: `don_mock_${Date.now()}`,
      amount,
      currency:   'INR',
    }, config)
  }

  if (method === 'post' && url.includes('payments/razorpay/verify')) {
    // In mock mode, simulate what the backend does: create the donation and update campaign stats
    const loggedInUser = resolveUserWithOverrides(config)
    
    // Look up the order details that were created previously
    const orderId = body.razorpay_order_id || ''
    const orderDetails = mockOrders[orderId] || { campaignId: '', amount: 500 }
    const { campaignId, amount } = orderDetails

    const campaignIndex = campaigns.findIndex(c => c.id === campaignId || c.slug === campaignId)
    
    const campaignTitle = campaignIndex !== -1 ? campaigns[campaignIndex].title : 'Campaign'
    if (campaignIndex !== -1) {
      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        raisedAmount: campaigns[campaignIndex].raisedAmount + amount,
        donorCount: campaigns[campaignIndex].donorCount + 1,
        updatedAt: new Date().toISOString(),
      }
    }

    const newDonation = {
      id: 'don-' + Date.now(),
      campaignId,
      campaignTitle,
      donorName: body.anonymous ? undefined : loggedInUser.name,
      donorAvatar: body.anonymous ? undefined : loggedInUser.avatar,
      amount,
      message: body.message,
      anonymous: body.anonymous || false,
      paymentMethod: 'card',
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      userId: loggedInUser.id,
    }
    donations.unshift(newDonation)
    saveDonations()
    saveCampaigns()

    return ok({ verified: true, message: 'Payment verified (mock)' }, config)
  }

  // ── DELETE (generic fallback) ──────────────────────────────────────────────
  fail('Not found', 404, config)
}

export function setupMocks() {
  api.defaults.adapter = mockAdapter
  console.log('[Mock API] Axios mock adapter active — no service worker needed')
}
