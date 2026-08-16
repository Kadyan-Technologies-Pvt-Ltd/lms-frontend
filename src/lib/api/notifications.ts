import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Notification, NotificationCreatePayload } from '@/types/notification'

export const notificationsApi = {
  list: (params: { is_read?: boolean; page_size?: number; ordering?: string } = {}) =>
    apiClient.get<ApiSuccess<Notification[]>>('/notifications/', { params }).then((res) => res.data),

  create: (payload: NotificationCreatePayload) =>
    apiClient.post<Notification>('/notifications/', payload).then((res) => res.data),

  markRead: (id: string) => apiClient.post<Notification>(`/notifications/${id}/mark_read/`).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/notifications/${id}/`),
}
