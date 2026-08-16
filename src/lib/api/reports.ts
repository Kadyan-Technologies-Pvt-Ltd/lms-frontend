import { apiClient } from '@/lib/api/client'
import type {
  AttendanceTrendItem,
  DashboardSummary,
  ExpenseBreakdownItem,
  ExpenseMonthlyTrendItem,
  ExportKind,
  MemberGrowthItem,
  MemberStatusBreakdownItem,
  RevenueBreakdownItem,
  RevenueMonthlyTrendItem,
} from '@/types/reports'

interface Envelope<T> {
  success: true
  data: T
  message: string | null
}

const EXPORT_PATH: Record<ExportKind, string> = {
  members: '/reports/export/members/',
  payments: '/reports/export/payments/',
  expenses: '/reports/export/expenses/',
  attendance: '/reports/export/attendance/',
}

export interface ExportDateRange {
  from?: string
  to?: string
}

export const reportsApi = {
  dashboard: () => apiClient.get<Envelope<DashboardSummary>>('/reports/dashboard/').then((res) => res.data.data),

  revenue: () => apiClient.get<Envelope<RevenueBreakdownItem[]>>('/reports/revenue/').then((res) => res.data.data),

  revenueMonthlyTrend: (months = 6) =>
    apiClient
      .get<Envelope<RevenueMonthlyTrendItem[]>>('/reports/revenue/monthly-trend/', { params: { months } })
      .then((res) => res.data.data),

  expenses: () => apiClient.get<Envelope<ExpenseBreakdownItem[]>>('/reports/expenses/').then((res) => res.data.data),

  expenseMonthlyTrend: (months = 6) =>
    apiClient
      .get<Envelope<ExpenseMonthlyTrendItem[]>>('/reports/expenses/monthly-trend/', { params: { months } })
      .then((res) => res.data.data),

  memberGrowth: (months = 6) =>
    apiClient
      .get<Envelope<MemberGrowthItem[]>>('/reports/members/growth/', { params: { months } })
      .then((res) => res.data.data),

  memberStatusBreakdown: () =>
    apiClient
      .get<Envelope<MemberStatusBreakdownItem[]>>('/reports/members/status-breakdown/')
      .then((res) => res.data.data),

  attendanceMonthlyTrend: (months = 6) =>
    apiClient
      .get<Envelope<AttendanceTrendItem[]>>('/reports/attendance/monthly-trend/', { params: { months } })
      .then((res) => res.data.data),

  /** Downloads a CSV export by triggering a browser save via a temporary blob link. */
  async downloadExport(kind: ExportKind, range?: ExportDateRange) {
    const response = await apiClient.get<Blob>(EXPORT_PATH[kind], {
      params: { from: range?.from || undefined, to: range?.to || undefined },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `${kind}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
