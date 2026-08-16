import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { expensesApi } from '@/lib/api/expenses'
import type { Expense, ExpensePayload } from '@/types/expense'

interface ExpenseFormDialogProps {
  expense: Expense | null | 'new'
  onOpenChange: (open: boolean) => void
}

const emptyForm = (): ExpensePayload => ({
  category: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  payment_method: '',
})

export function ExpenseFormDialog({ expense, onOpenChange }: ExpenseFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = expense && expense !== 'new'
  const [form, setForm] = useState<ExpensePayload>(emptyForm())

  const categoriesQuery = useQuery({ queryKey: ['expense-categories'], queryFn: expensesApi.categories, enabled: !!expense })

  useEffect(() => {
    if (isEdit) {
      setForm({
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        payment_method: expense.payment_method,
      })
    } else {
      setForm(emptyForm())
    }
  }, [expense, isEdit])

  const mutation = useMutation({
    mutationFn: () => (isEdit ? expensesApi.update(expense.id, form) : expensesApi.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      toast.success(isEdit ? 'Expense updated.' : 'Expense recorded.')
      onOpenChange(false)
    },
    onError: () => toast.error('Could not save expense. Check the form for errors.'),
  })

  return (
    <Dialog open={!!expense} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit expense' : 'Record expense'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={categoriesQuery.isLoading ? 'Loading…' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categoriesQuery.data?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount (₹)</Label>
              <Input
                id="exp-amount"
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input id="exp-date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-method">Payment method</Label>
            <Input
              id="exp-method"
              value={form.payment_method}
              onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
              placeholder="Cash, UPI, bank transfer…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-description">Description</Label>
            <Textarea
              id="exp-description"
              rows={2}
              placeholder="What was this expense for? (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.category || !form.amount || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Record expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
