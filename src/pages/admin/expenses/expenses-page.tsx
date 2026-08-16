import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Receipt, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDeleteAlert } from '@/components/common/confirm-delete-alert'
import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { expensesApi } from '@/lib/api/expenses'
import type { Expense } from '@/types/expense'

import { buildExpenseColumns } from './columns'
import { ExpenseCategoriesPanel } from './expense-categories-panel'
import { ExpenseFormDialog } from './expense-form-dialog'
import { ExpensesAnalyticsPanel } from './expenses-analytics-panel'

export function ExpensesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [formExpense, setFormExpense] = useState<Expense | null | 'new'>(null)
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null)

  const expensesQuery = useQuery({
    queryKey: ['expenses', { search }],
    queryFn: () => expensesApi.list({ search: search || undefined, page_size: 100, ordering: '-date' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Expense deleted.')
      setDeleteExpense(null)
    },
    onError: () => toast.error('Could not delete expense.'),
  })

  const columns = useMemo(() => buildExpenseColumns({ onEdit: setFormExpense, onDelete: setDeleteExpense }), [])
  const expenses = expensesQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track spending and see where the money goes."
        actions={
          <Button onClick={() => setFormExpense('new')}>
            <Plus className="mr-2 h-4 w-4" />
            Record Expense
          </Button>
        }
      />

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search description, category…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {!expensesQuery.isLoading && expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={search ? 'Try a different search.' : 'Record your first expense to get started.'}
              action={
                !search ? (
                  <Button onClick={() => setFormExpense('new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Expense
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DataTable columns={columns} data={expenses} isLoading={expensesQuery.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <ExpensesAnalyticsPanel />
        </TabsContent>

        <TabsContent value="categories">
          <ExpenseCategoriesPanel />
        </TabsContent>
      </Tabs>

      <ExpenseFormDialog expense={formExpense} onOpenChange={(open) => !open && setFormExpense(null)} />
      <ConfirmDeleteAlert
        open={!!deleteExpense}
        onOpenChange={(open) => !open && setDeleteExpense(null)}
        title={`Delete this expense?`}
        description={`₹${deleteExpense?.amount} (${deleteExpense?.category_name}) on ${deleteExpense?.date}. This can't be undone.`}
        onConfirm={() => deleteExpense && deleteMutation.mutate(deleteExpense.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
