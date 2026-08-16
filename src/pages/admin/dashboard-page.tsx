import { useQuery } from '@tanstack/react-query'
import { IndianRupee, Receipt, Sofa, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { StaggerGrid, StaggerItem } from '@/components/common/stagger-grid'
import { StatCard } from '@/components/common/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsApi } from '@/lib/api/reports'

const CHART_COLORS = ['hsl(243 75% 59%)', 'hsl(199 89% 48%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(160 84% 39%)']

function formatCurrency(value: number | string | undefined) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(value ?? 0),
  )
}

export function AdminDashboardPage() {
  const summaryQuery = useQuery({ queryKey: ['reports', 'dashboard'], queryFn: reportsApi.dashboard })
  const revenueQuery = useQuery({ queryKey: ['reports', 'revenue'], queryFn: reportsApi.revenue })
  const expensesQuery = useQuery({ queryKey: ['reports', 'expenses'], queryFn: reportsApi.expenses })

  const summary = summaryQuery.data
  const revenue = revenueQuery.data ?? []
  const expenses = expensesQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of members, revenue, seats, and expenses." />

      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            label="Active Members"
            icon={Users}
            isLoading={summaryQuery.isLoading}
            value={summary ? summary.members.active : 0}
            hint={summary ? `${summary.members.total} total` : undefined}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Revenue This Month"
            icon={IndianRupee}
            isLoading={summaryQuery.isLoading}
            value={summary ? formatCurrency(summary.revenue_this_month) : '—'}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Seats Occupied"
            icon={Sofa}
            isLoading={summaryQuery.isLoading}
            value={summary ? summary.seats.occupied : 0}
            hint={summary ? `${summary.seats.total} total` : undefined}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Expenses This Month"
            icon={Receipt}
            isLoading={summaryQuery.isLoading}
            value={summary ? formatCurrency(summary.expenses_this_month) : '—'}
          />
        </StaggerItem>
      </StaggerGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by payment method</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueQuery.isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-muted" />
            ) : revenue.length === 0 ? (
              <EmptyState icon={IndianRupee} title="No completed payments yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={revenue}
                    dataKey="total"
                    nameKey="payment_method"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {revenue.map((entry, index) => (
                      <Cell key={entry.payment_method} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesQuery.isLoading ? (
              <div className="h-64 animate-pulse rounded-md bg-muted" />
            ) : expenses.length === 0 ? (
              <EmptyState icon={Receipt} title="No expenses recorded yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={expenses}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="category__name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="total" fill="hsl(243 75% 59%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
