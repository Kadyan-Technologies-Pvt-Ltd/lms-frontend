export interface DashboardSummary {
  members: {
    total: number
    active: number
  }
  revenue_this_month: number
  expenses_this_month: number
  seats: {
    total: number
    occupied: number
  }
}

export interface RevenueBreakdownItem {
  payment_method: string
  total: number
  count: number
}

export interface RevenueMonthlyTrendItem {
  month: string
  total: number
}

export interface ExpenseBreakdownItem {
  category__name: string | null
  total: number
  count: number
}

export interface ExpenseMonthlyTrendItem {
  month: string
  total: number
}

export interface MemberGrowthItem {
  month: string
  count: number
}

export interface MemberStatusBreakdownItem {
  status: string
  count: number
}

export interface AttendanceTrendItem {
  month: string
  count: number
}

export type ExportKind = 'members' | 'payments' | 'expenses' | 'attendance'
