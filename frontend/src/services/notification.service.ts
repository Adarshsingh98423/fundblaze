import { api } from './api'
import type { PaginatedResponse } from '@/types/campaign.types'

export interface Notification {
  id: string
  type: 'donation_received' | 'campaign_funded' | 'campaign_update' | 'general'
  title: string
  message: string
  isRead: boolean
  metadata: Record<string, unknown>
  createdAt: string
}

export interface NotificationsResponse extends PaginatedResponse<Notification> {
  unreadCount: number
}

export const notificationService = {
  async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<NotificationsResponse> {
    const { data } = await api.get('/notifications', { params })
    return data
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await api.put(`/notifications/${id}/read`)
    return data
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all')
  },
}
