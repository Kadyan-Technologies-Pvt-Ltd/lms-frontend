import { useQuery } from '@tanstack/react-query'
import { IndianRupee } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { EmptyState } from '@/components/common/empty-state'
import { StatCard } from '@/components/common/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi } from '@/lib/api/reports'

const CHART_COLORS = ['hsl(243 75% 59%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(160 84% 39%)']

function formatCurrency(value: number | string | undefined) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(value ?? 0),
  )
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

export function RevenueReportPanel() {
  const breakdownQuery = useQuery({ queryKey: ['reports', 'revenue'], queryFn: reportsApi.revenue })
  const trendQuery = useQuery({
    queryKey: ['reports', 'revenue', 'trend'],
    queryFn: () => reportsApi.revenueMonthlyTrend(6),
  })

  const breakdown = breakdownQuery.data ?? []
  const trend = (trendQuery.data ?? []).map((item) => ({ ...item, label: formatMonth(item.month) }))

  const thisMonth = trend.at(-1)?.total ?? 0
  const lastMonth = trend.at(-2)?.total ?? 0
  const change = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="This month" icon={IndianRupee} isLoading={trendQuery.isLoading} value={formatCurrency(thisMonth)} />
        <StatCard
          label="vs. last month"
          icon={IndianRupee}
          isLoading={trendQuery.isLoading}
          value={change === null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
          hint={lastMonth ? `Last month: ${formatCurrency(lastMonth)}` : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {trendQuery.isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-muted" />
            ) : trend.length === 0 ? (
              <EmptyState icon={IndianRupee} title="No revenue recorded yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="total" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By payment method</CardTitle>
          </CardHeader>
          <CardContent>
            {breakdownQuery.isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-muted" />
            ) : breakdown.length === 0 ? (
              <EmptyState icon={IndianRupee} title="No revenue recorded yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={breakdown} dataKey="total" nameKey="payment_method" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {breakdown.map((entry, index) => (
                      <Cell key={entry.payment_method} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
