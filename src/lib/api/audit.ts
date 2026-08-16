import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { AuditLog } from '@/types/audit'

export interface AuditLogListParams {
  search?: string
  action?: string
  page_size?: number
  ordering?: string
}

export const auditApi = {
  list: (params: AuditLogListParams = {}) =>
    apiClient.get<ApiSuccess<AuditLog[]>>('/audit/', { params }).then((res) => res.data),
}
