import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { expensesApi } from '@/lib/api/expenses'
import type { ExpenseCategoryPayload } from '@/types/expense'

function CreateCategoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ExpenseCategoryPayload>({ name: '' })

  const mutation = useMutation({
    mutationFn: expensesApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      toast.success('Category created.')
      setForm({ name: '' })
      onOpenChange(false)
    },
    onError: () => toast.error('Could not create category — the name may already be in use.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New expense category</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="exp-cat-name">Name</Label>
          <Input id="exp-cat-name" placeholder="e.g. Rent, Electricity, Internet" value={form.name} onChange={(e) => setForm({ name: e.target.value })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.name || mutation.isPending} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Creating…' : 'Create category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ExpenseCategoriesPanel() {
  const [createOpen, setCreateOpen] = useState(false)
  const categoriesQuery = useQuery({ queryKey: ['expense-categories'], queryFn: expensesApi.categories })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {categoriesQuery.data?.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" description="Create one (Rent, Electricity, Internet…) before recording expenses." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesQuery.data?.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="flex items-center justify-between pt-6">
                <h3 className="font-medium">{cat.name}</h3>
                <Badge variant={cat.is_active ? 'default' : 'secondary'}>{cat.is_active ? 'Active' : 'Inactive'}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
