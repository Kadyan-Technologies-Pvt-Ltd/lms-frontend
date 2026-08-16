export type BiometricProviderType = 'MOCK' | 'ZKTECO' | 'SUPREMA' | 'BIOMAX' | 'CUSTOM'
export type BiometricDeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR'
export type BiometricSyncStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED'

export interface BiometricDevice {
  id: string
  name: string
  device_uid: string
  ip_address: string | null
  port: number | null
  location: string
  provider: BiometricProviderType
  status: BiometricDeviceStatus
  last_sync_at: string | null
  config_json: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface BiometricDevicePayload {
  name: string
  device_uid: string
  provider: BiometricProviderType
  ip_address?: string
  port?: number
  location?: string
}

export interface BiometricSyncRecord {
  id: string
  device: string
  sync_started_at: string
  sync_completed_at: string | null
  records_fetched: number
  records_saved: number
  status: BiometricSyncStatus
  error_message: string
  created_at: string
  updated_at: string
}
