import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type {
  Seat,
  SeatAllocation,
  SeatAllocationPayload,
  SeatCategory,
  SeatCategoryPayload,
  SeatPayload,
  SeatStatus,
  Shift,
  ShiftPayload,
} from '@/types/seat'

export interface SeatListParams {
  search?: string
  status?: SeatStatus
  category?: string
  page_size?: number
}

export const seatsApi = {
  list: (params: SeatListParams = {}) =>
    apiClient.get<ApiSuccess<Seat[]>>('/seats/', { params }).then((res) => res.data),
  create: (payload: SeatPayload) => apiClient.post<Seat>('/seats/', payload).then((res) => res.data),
  update: (id: string, payload: Partial<SeatPayload>) =>
    apiClient.patch<Seat>(`/seats/${id}/`, payload).then((res) => res.data),
}

export const shiftsApi = {
  list: () => apiClient.get<ApiSuccess<Shift[]>>('/seats/shifts/').then((res) => res.data.data),
  create: (payload: ShiftPayload) => apiClient.post<Shift>('/seats/shifts/', payload).then((res) => res.data),
}

export const seatCategoriesApi = {
  list: () => apiClient.get<ApiSuccess<SeatCategory[]>>('/seats/categories/').then((res) => res.data.data),
  create: (payload: SeatCategoryPayload) =>
    apiClient.post<SeatCategory>('/seats/categories/', payload).then((res) => res.data),
}

export const seatAllocationsApi = {
  listForSeat: (seatId: string) =>
    apiClient
      .get<ApiSuccess<SeatAllocation[]>>('/seats/allocations/', { params: { seat: seatId, is_active: true } })
      .then((res) => res.data.data),

  create: (payload: SeatAllocationPayload) =>
    apiClient.post<SeatAllocation>('/seats/allocations/', payload).then((res) => res.data),

  release: (id: string) => apiClient.post<SeatAllocation>(`/seats/allocations/${id}/release/`).then((res) => res.data),
}
