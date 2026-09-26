import type { User } from '@/types/user.types'

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    username: 'aarav_sharma',
    email: 'aarav@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    bio: 'Renewable energy engineer with 10 years of field experience across rural India.',
    role: 'creator',
    verified: true,
    stats: { totalRaised: 2800000, activeCampaigns: 2, totalDonors: 1200, campaignsBacked: 0 },
    createdAt: '2022-03-15T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'Priya Patel',
    username: 'priya_patel',
    email: 'priya@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80',
    bio: 'Environmental engineer and social activist focused on water sanitation.',
    role: 'creator',
    verified: true,
    stats: { totalRaised: 4200000, activeCampaigns: 2, totalDonors: 1800, campaignsBacked: 0 },
    createdAt: '2021-08-10T10:00:00Z',
  },
  {
    id: 'u3',
    name: 'Rohan Mehta',
    username: 'rohan_mehta',
    email: 'rohan@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    bio: 'Community organiser and arts advocate based in Mumbai.',
    role: 'creator',
    verified: true,
    stats: { totalRaised: 1500000, activeCampaigns: 1, totalDonors: 600, campaignsBacked: 0 },
    createdAt: '2023-01-20T10:00:00Z',
  },
  {
    id: 'u4',
    name: 'Ananya Iyer',
    username: 'ananya_iyer',
    email: 'ananya@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    bio: 'Medical professional and healthcare access advocate.',
    role: 'creator',
    verified: false,
    stats: { totalRaised: 800000, activeCampaigns: 1, totalDonors: 400, campaignsBacked: 0 },
    createdAt: '2023-05-12T10:00:00Z',
  },
  {
    id: 'u5',
    name: 'Test Donor',
    username: 'test_donor',
    email: 'donor@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    bio: 'Supporting impactful campaigns across India.',
    role: 'donor',
    verified: true,
    stats: { totalRaised: 0, activeCampaigns: 0, totalDonors: 0, campaignsBacked: 8 },
    createdAt: '2023-09-01T10:00:00Z',
  },
  {
    id: 'u6',
    name: 'Admin User',
    username: 'admin_fundblaze',
    email: 'admin@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
    bio: 'FundBlaze platform administrator.',
    role: 'admin',
    verified: true,
    stats: { totalRaised: 0, activeCampaigns: 0, totalDonors: 0, campaignsBacked: 0 },
    createdAt: '2021-01-01T10:00:00Z',
  },
]

// Credential map: email → { password, user }
export const mockCredentials: Record<string, { password: string; user: User }> = {
  'aarav@fundblaze.com':  { password: 'password123', user: mockUsers[0] },
  'priya@fundblaze.com':  { password: 'password123', user: mockUsers[1] },
  'rohan@fundblaze.com':  { password: 'password123', user: mockUsers[2] },
  'ananya@fundblaze.com': { password: 'password123', user: mockUsers[3] },
  'donor@fundblaze.com':  { password: 'password123', user: mockUsers[4] },
  'admin@fundblaze.com':  { password: 'admin1234',   user: mockUsers[5] },
  // legacy demo alias
  'test@fundblaze.com':   { password: 'password123', user: mockUsers[0] },
}

// Keep this export for any code that still references it
export const mockTestUser = {
  email: 'test@fundblaze.com',
  password: 'password123',
  user: mockUsers[0],
}
