export interface AuditLog {
  id: string
  actor: string | null
  actor_email: string | null
  action: string
  target_type: number | null
  target_type_name: string | null
  target_id: string
  description: string
  ip_address: string | null
  created_at: string
  updated_at: string
}
