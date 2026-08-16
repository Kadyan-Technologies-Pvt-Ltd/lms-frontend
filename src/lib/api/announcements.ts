import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Announcement, AnnouncementPayload } from '@/types/announcement'

export const announcementsApi = {
  list: (params: { page_size?: number } = {}) =>
    apiClient.get<ApiSuccess<Announcement[]>>('/announcements/', { params }).then((res) => res.data.data),

  create: (payload: AnnouncementPayload) =>
    apiClient.post<Announcement>('/announcements/', payload).then((res) => res.data),

  update: (id: string, payload: Partial<AnnouncementPayload>) =>
    apiClient.patch<Announcement>(`/announcements/${id}/`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/announcements/${id}/`),
}
