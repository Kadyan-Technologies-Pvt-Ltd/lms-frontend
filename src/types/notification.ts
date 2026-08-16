export type NotificationType = 'INFO' | 'WARNING' | 'PAYMENT' | 'MEMBERSHIP' | 'SEAT' | 'GENERAL'

export interface Notification {
  id: string
  member: string | null
  member_name: string | null
  member_id_display: string | null
  title: string
  message: string
  notification_type: NotificationType
  is_read: boolean
  read_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface NotificationCreatePayload {
  title: string
  message: string
  notification_type: NotificationType
  member?: string
}
