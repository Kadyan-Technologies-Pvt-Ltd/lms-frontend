import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { EmptyState } from '@/components/common/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi } from '@/lib/api/reports'

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

export function AttendanceReportPanel() {
  const trendQuery = useQuery({
    queryKey: ['reports', 'attendance', 'trend'],
    queryFn: () => reportsApi.attendanceMonthlyTrend(6),
  })

  const trend = (trendQuery.data ?? []).map((item) => ({ ...item, label: formatMonth(item.month) }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance punches by month</CardTitle>
      </CardHeader>
      <CardContent>
        {trendQuery.isLoading ? (
          <div className="h-64 animate-pulse rounded-md bg-muted" />
        ) : trend.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance recorded in this window"
            description="Records appear here once members are registered on a device and it's synced."
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
