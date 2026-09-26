import { api } from './api'
import type { LoginCredentials, SignupData, User } from '@/types/user.types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; accessToken: string }> {
    const { data } = await api.post('/auth/login', credentials)
    return data
  },

  async signup(data: SignupData): Promise<{ user: User; accessToken: string }> {
    const { data: res } = await api.post('/auth/signup', data)
    return res
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me')
    return data
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await api.post('/auth/refresh')
    return data
  },
}
