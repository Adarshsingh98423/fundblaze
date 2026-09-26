export interface Donation {
  id: string
  campaignId: string
  campaignTitle: string
  donorId?: string
  donorName?: string
  donorAvatar?: string
  amount: number
  message?: string
  anonymous: boolean
  paymentMethod: 'card' | 'upi' | 'netbanking'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  createdAt: string
}

export interface CreateDonationDto {
  campaignId: string
  amount: number
  message?: string
  anonymous: boolean
  paymentMethod: 'card' | 'upi' | 'netbanking'
}

export interface DonationStats {
  totalDonations: number
  totalAmount: number
  avgDonation: number
  topDonors: Array<{
    name: string
    amount: number
    avatar?: string
  }>
}
