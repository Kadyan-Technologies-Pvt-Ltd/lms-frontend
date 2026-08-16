export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface MembershipPlan {
  id: string
  name: string
  duration_days: number
  price: string
  shift: string | null
  seat_category: string | null
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MembershipPlanPayload {
  name: string
  duration_days: number
  price: string
  description?: string
  is_active?: boolean
}

export interface Membership {
  id: string
  member: string
  plan: string
  plan_detail: MembershipPlan
  start_date: string
  end_date: string
  status: MembershipStatus
  auto_renew: boolean
  amount_paid: string
  amount_due: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface MembershipCreatePayload {
  member: string
  plan: string
  start_date: string
  end_date?: string
  auto_renew?: boolean
}
