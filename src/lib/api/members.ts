import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type {
  MemberCreatePayload,
  MemberCreateResponse,
  MemberProfile,
  MemberStatus,
  MemberUpdatePayload,
} from '@/types/member'

export interface MemberListParams {
  search?: string
  status?: MemberStatus
  page?: number
  page_size?: number
  ordering?: string
}

export const membersApi = {
  list: (params: MemberListParams = {}) =>
    apiClient.get<ApiSuccess<MemberProfile[]>>('/members/', { params }).then((res) => res.data),

  get: (id: string) => apiClient.get<MemberProfile>(`/members/${id}/`).then((res) => res.data),

  me: () => apiClient.get<MemberProfile>('/members/me/').then((res) => res.data),

  create: (payload: MemberCreatePayload) =>
    apiClient.post<MemberCreateResponse>('/members/', payload).then((res) => res.data),

  update: (id: string, payload: MemberUpdatePayload) =>
    apiClient.patch<MemberProfile>(`/members/${id}/`, payload).then((res) => res.data),

  blacklist: (id: string, reason: string) =>
    apiClient.post<MemberProfile>(`/members/${id}/blacklist/`, { reason }).then((res) => res.data),

  restore: (id: string) => apiClient.post<MemberProfile>(`/members/${id}/restore/`).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/members/${id}/`),

  adjustPoints: (id: string, delta: number, reason: string) =>
    apiClient.post<MemberProfile>(`/members/${id}/adjust_points/`, { delta, reason }).then((res) => res.data),

  registerBiometric: (id: string, device: string) =>
    apiClient.post<MemberProfile>(`/members/${id}/register_biometric/`, { device }).then((res) => res.data),
}
