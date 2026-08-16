import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { EmptyState } from '@/components/common/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi } from '@/lib/api/reports'

const CHART_COLORS = ['hsl(243 75% 59%)', 'hsl(160 84% 39%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(199 89% 48%)']

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

export function MembersReportPanel() {
  const growthQuery = useQuery({
    queryKey: ['reports', 'members', 'growth'],
    queryFn: () => reportsApi.memberGrowth(6),
  })
  const statusQuery = useQuery({
    queryKey: ['reports', 'members', 'status'],
    queryFn: reportsApi.memberStatusBreakdown,
  })

  const growth = (growthQuery.data ?? []).map((item) => ({ ...item, label: formatMonth(item.month) }))
  const statusBreakdown = statusQuery.data ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>New members by month</CardTitle>
        </CardHeader>
        <CardContent>
          {growthQuery.isLoading ? (
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          ) : growth.length === 0 ? (
            <EmptyState icon={Users} title="No members joined in this window" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(243 75% 59%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusQuery.isLoading ? (
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          ) : statusBreakdown.length === 0 ? (
            <EmptyState icon={Users} title="No members yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
