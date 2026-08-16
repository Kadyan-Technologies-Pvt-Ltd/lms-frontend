export type AttendanceSource = 'BIOMETRIC' | 'IMPORT'

export interface AttendanceRecord {
  id: string
  member: string
  member_name: string
  member_id_display: string
  biometric_uid: string
  date: string
  entry_time: string | null
  exit_time: string | null
  device: string | null
  device_name: string | null
  sync_record: string | null
  source: AttendanceSource
  created_at: string
  updated_at: string
}
