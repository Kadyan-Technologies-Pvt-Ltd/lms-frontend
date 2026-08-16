import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { AttendanceRecord } from '@/types/attendance'

export interface AttendanceListParams {
  member?: string
  date?: string
  page_size?: number
  ordering?: string
}

export const attendanceApi = {
  list: (params: AttendanceListParams = {}) =>
    apiClient.get<ApiSuccess<AttendanceRecord[]>>('/attendance/', { params }).then((res) => res.data),
}
