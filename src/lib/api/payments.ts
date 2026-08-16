import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  MemberCreateOrderPayload,
  MemberVerifyPaymentPayload,
  Payment,
  PaymentMethod,
  PaymentStatus,
  RecordPaymentPayload,
  VerifyPaymentPayload,
} from '@/types/payment'

export interface PaymentListParams {
  search?: string
  status?: PaymentStatus
  payment_method?: PaymentMethod
  page_size?: number
  ordering?: string
}

export const paymentsApi = {
  list: (params: PaymentListParams = {}) =>
    apiClient.get<ApiSuccess<Payment[]>>('/payments/', { params }).then((res) => res.data),

  record: (payload: RecordPaymentPayload) => apiClient.post<Payment>('/payments/', payload).then((res) => res.data),

  createOrder: (payload: CreateOrderPayload) =>
    apiClient.post<ApiSuccess<CreateOrderResponse>>('/payments/create-order/', payload).then((res) => res.data.data),

  verify: (payload: VerifyPaymentPayload) =>
    apiClient.post<ApiSuccess<Payment>>('/payments/verify/', payload).then((res) => res.data.data),

  createSelfOrder: (payload: MemberCreateOrderPayload) =>
    apiClient.post<ApiSuccess<CreateOrderResponse>>('/payments/member/create-order/', payload).then((res) => res.data.data),

  verifySelf: (payload: MemberVerifyPaymentPayload) =>
    apiClient.post<ApiSuccess<Payment>>('/payments/member/verify/', payload).then((res) => res.data.data),
}
