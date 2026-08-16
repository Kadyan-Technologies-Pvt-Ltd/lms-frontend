import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { BiometricDevice, BiometricDevicePayload, BiometricSyncRecord } from '@/types/biometric'

export const biometricDevicesApi = {
  list: () => apiClient.get<ApiSuccess<BiometricDevice[]>>('/biometric/devices/').then((res) => res.data.data),

  create: (payload: BiometricDevicePayload) =>
    apiClient.post<BiometricDevice>('/biometric/devices/', payload).then((res) => res.data),

  testConnection: (id: string) =>
    apiClient.post<{ connected: boolean; status: string }>(`/biometric/devices/${id}/test_connection/`).then((res) => res.data),

  sync: (id: string) => apiClient.post<BiometricSyncRecord>(`/biometric/devices/${id}/sync/`).then((res) => res.data),
}

export const biometricSyncRecordsApi = {
  listForDevice: (deviceId: string) =>
    apiClient
      .get<ApiSuccess<BiometricSyncRecord[]>>('/biometric/sync-records/', {
        params: { device: deviceId, ordering: '-sync_started_at' },
      })
      .then((res) => res.data.data),
}
