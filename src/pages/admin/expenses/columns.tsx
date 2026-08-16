import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import type { Expense } from '@/types/expense'

interface ExpenseRowActions {
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export function buildExpenseColumns(actions: ExpenseRowActions): ColumnDef<Expense>[] {
  return [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'category_name', header: 'Category' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `₹${row.original.amount}`,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="line-clamp-1 text-muted-foreground">{row.original.description || '—'}</span>,
    },
    { accessorKey: 'payment_method', header: 'Method', cell: ({ row }) => row.original.payment_method || '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => actions.onEdit(row.original)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => actions.onDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]
}
