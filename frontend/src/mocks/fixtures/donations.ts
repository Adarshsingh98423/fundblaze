import type { Donation } from '@/types/donation.types'

export const mockDonations: Donation[] = [
  { id: 'd1', campaignId: '1', campaignTitle: 'SolarGrid', donorName: 'Sarah Jenkins', donorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80', amount: 2500, message: 'Amazing initiative!', anonymous: false, paymentMethod: 'card', status: 'completed', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'd2', campaignId: '1', campaignTitle: 'SolarGrid', donorName: 'Michael Chen', amount: 500, anonymous: false, paymentMethod: 'upi', status: 'completed', createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
  { id: 'd3', campaignId: '1', campaignTitle: 'SolarGrid', amount: 1000, anonymous: true, paymentMethod: 'card', status: 'completed', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'd4', campaignId: '2', campaignTitle: 'Clean Water', donorName: 'Riya Kapoor', amount: 5000, anonymous: false, paymentMethod: 'netbanking', status: 'completed', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'd5', campaignId: '3', campaignTitle: 'Canvas of Hope', donorName: 'Arjun Mehta', amount: 1500, anonymous: false, paymentMethod: 'upi', status: 'completed', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
]
