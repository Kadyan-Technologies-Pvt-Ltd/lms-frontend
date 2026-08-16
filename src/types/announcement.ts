export type AnnouncementTarget = 'ALL' | 'SPECIFIC_MEMBER'
export type AnnouncementPriority = 'NORMAL' | 'HIGH' | 'URGENT'

export interface Announcement {
  id: string
  title: string
  content: string
  target: AnnouncementTarget
  member: string | null
  published_at: string
  expires_at: string | null
  is_active: boolean
  priority: AnnouncementPriority
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AnnouncementPayload {
  title: string
  content: string
  target: AnnouncementTarget
  member?: string
  published_at: string
  expires_at?: string
  priority: AnnouncementPriority
  is_active: boolean
}
