export type UserRole = 'donor' | 'creator' | 'admin'

export interface User {
  id: string
  name: string
  username: string
  email: string
  contactEmail?: string
  avatar?: string
  bio?: string
  role: UserRole
  verified: boolean
  socialLinks?: {
    twitter?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
  stats?: {
    totalRaised: number
    activeCampaigns: number
    totalDonors: number
    campaignsBacked: number
  }
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  agreedToTerms: boolean
}
