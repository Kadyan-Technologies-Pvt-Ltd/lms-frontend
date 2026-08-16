import { apiClient } from '@/lib/api/client'
import type { LoginRequest, LoginResponse, User } from '@/types/auth'

export const authApi = {
  login: (payload: LoginRequest) => apiClient.post<LoginResponse>('/auth/login/', payload).then((res) => res.data),

  me: () => apiClient.get<{ success: true; data: User }>('/auth/me/').then((res) => res.data.data),

  logout: () => apiClient.post('/auth/logout/').then((res) => res.data),

  changePassword: (payload: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/change-password/', payload).then((res) => res.data),
}
