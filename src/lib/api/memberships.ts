import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Membership, MembershipCreatePayload, MembershipPlan, MembershipPlanPayload } from '@/types/membership'

export const membershipPlansApi = {
  list: (params: { is_active?: boolean } = {}) =>
    apiClient.get<ApiSuccess<MembershipPlan[]>>('/memberships/plans/', { params }).then((res) => res.data.data),

  create: (payload: MembershipPlanPayload) =>
    apiClient.post<MembershipPlan>('/memberships/plans/', payload).then((res) => res.data),

  update: (id: string, payload: Partial<MembershipPlanPayload>) =>
    apiClient.patch<MembershipPlan>(`/memberships/plans/${id}/`, payload).then((res) => res.data),
}

export const membershipsApi = {
  listForMember: (memberId: string) =>
    apiClient
      .get<ApiSuccess<Membership[]>>('/memberships/', { params: { member: memberId, ordering: '-start_date' } })
      .then((res) => res.data.data),

  create: (payload: MembershipCreatePayload) =>
    apiClient.post<Membership>('/memberships/', payload).then((res) => res.data),
}
